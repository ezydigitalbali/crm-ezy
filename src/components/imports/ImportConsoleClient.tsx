"use client";
import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  Download, 
  Building2, 
  ChevronDown, 
  SlidersHorizontal,
  RefreshCw,
  HelpCircle
} from "lucide-react";
import CustomDropdown from "@/components/ui/CustomDropdown";

interface SisterCompanyProp {
  id: string;
  name: string;
  code: string | null;
}

const FIELD_DEFINITIONS = [
  { key: "business_name", label: "Nama Bisnis / Perusahaan", required: true, candidates: ["nama perusahaan", "nama bisnis", "nama usaha", "perusahaan", "business name", "company", "nama customer", "customer", "customer name", "client", "nama client", "nama", "name", "brand", "nama brand", "villa", "nama villa", "hotel", "resto", "restaurant"] },
  { key: "contact_name", label: "Nama PIC / Kontak", required: false, candidates: ["nama pic client", "nama pic", "pic client", "pic", "nama contact", "contact name", "contact person", "owner", "nama owner", "manager", "pengelola", "nama kontak", "contact", "person"] },
  { key: "phone", label: "No HP / WhatsApp", required: false, candidates: ["telepon", "no hp", "no. hp", "phone", "telp", "no telp", "no. telp", "nomor telepon", "no wa", "whatsapp", "wa", "no whatsapp", "kontak", "mobile", "contact number"] },
  { key: "address", label: "Alamat Lengkap", required: false, candidates: ["alamat", "address", "jalan", "street", "domisili", "lokasi detail"] },
  { key: "city", label: "Kota / Area (Auto-Extract dari Alamat)", required: false, candidates: ["kota", "city", "lokasi", "location", "area", "wilayah", "kabupaten", "kecamatan", "daerah"] },
  { key: "category", label: "Kategori Bisnis (Auto-Detect dari Nama)", required: false, candidates: ["kategori", "category", "jenis usaha", "tipe bisnis", "industry", "tipe", "sektor", "bidang", "jenis"] },
  { key: "email", label: "Email", required: false, candidates: ["email", "e-mail", "surel", "mail", "email address"] },
  { key: "website", label: "Website (Opsional)", required: false, candidates: ["website", "web", "domain", "url", "link website", "situs"] },
  { key: "instagram", label: "Instagram Handle (Opsional)", required: false, candidates: ["instagram", "ig", "instagram handle", "username", "username ig", "akun ig", "sosmed"] },
  { key: "sister_company", label: "Kolom Sister Company (Opsional)", required: false, candidates: ["sister company", "perusahaan sister", "sister_company", "asal database", "database", "source", "company"] },
];

export default function ImportConsoleClient({
  sisterCompanies = [],
}: {
  sisterCompanies?: SisterCompanyProp[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [fileName, setFileName] = useState<string | null>(null);
  const [rawWorkbook, setRawWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  
  const [selectedSisterCompany, setSelectedSisterCompany] = useState<string>("AUTO");
  const [duplicateStrategy, setDuplicateStrategy] = useState<"SKIP" | "MERGE" | "CREATE">("SKIP");
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; total: number } | null>(null);

  // Auto detect best header mapping
  const autoMapColumns = (cols: string[]) => {
    const mapping: Record<string, string> = {};

    FIELD_DEFINITIONS.forEach((field) => {
      const match = cols.find((col) => {
        const cleanCol = col.toLowerCase().replace(/[^a-z0-9]/g, "");
        return field.candidates.some((cand) => {
          const cleanCand = cand.toLowerCase().replace(/[^a-z0-9]/g, "");
          return cleanCol === cleanCand || cleanCol.includes(cleanCand);
        });
      });

      mapping[field.key] = match || "NONE";
    });

    // Fallback: if business_name is not matched, pick first column
    if (mapping["business_name"] === "NONE" && cols.length > 0) {
      mapping["business_name"] = cols[0];
    }

    return mapping;
  };

  // Process a worksheet into rows & detected columns with smart header detection
  const processSheet = (wb: XLSX.WorkBook, sName: string) => {
    try {
      const ws = wb.Sheets[sName];
      if (!ws) return;

      // 1. Read sheet as 2D array of rows to find true header row
      const rawMatrix = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false }) as any[][];
      if (!rawMatrix || rawMatrix.length === 0) {
        setErrorMessage(`Sheet "${sName}" tampak kosong.`);
        setParsedRows([]);
        setDetectedColumns([]);
        return;
      }

      // Scan rows 0 to 15 to find the row with the most header-like text
      let bestHeaderRowIndex = 0;
      let maxScore = -1;

      for (let r = 0; r < Math.min(rawMatrix.length, 15); r++) {
        const row = rawMatrix[r];
        if (!Array.isArray(row)) continue;

        let score = 0;
        row.forEach((cell) => {
          if (typeof cell === "string" && cell.trim().length > 0) {
            score += 1;
            const str = cell.toLowerCase();
            if (
              str.includes("nama") ||
              str.includes("name") ||
              str.includes("bisnis") ||
              str.includes("business") ||
              str.includes("phone") ||
              str.includes("hp") ||
              str.includes("wa") ||
              str.includes("email") ||
              str.includes("kota") ||
              str.includes("city") ||
              str.includes("kategori")
            ) {
              score += 3;
            }
          }
        });

        if (score > maxScore) {
          maxScore = score;
          bestHeaderRowIndex = r;
        }
      }

      // 2. Parse rows starting from bestHeaderRowIndex
      const jsonData = XLSX.utils.sheet_to_json(ws, {
        range: bestHeaderRowIndex,
        defval: "",
        raw: false,
      }) as any[];

      if (jsonData.length === 0) {
        setErrorMessage("Tidak ada data yang terbaca dari sheet yang dipilih.");
        setParsedRows([]);
        setDetectedColumns([]);
        return;
      }

      // 3. Extract unique column names
      const colsSet = new Set<string>();
      jsonData.forEach((row) => {
        Object.keys(row).forEach((k) => {
          if (k && !k.startsWith("__EMPTY")) colsSet.add(k);
        });
      });

      const cols = Array.from(colsSet);
      setDetectedColumns(cols);
      const autoMapped = autoMapColumns(cols);
      setColumnMapping(autoMapped);
      setParsedRows(jsonData);
      setErrorMessage(null);
    } catch (err: any) {
      console.error("Sheet process error:", err);
      setErrorMessage("Gagal memproses sheet Excel: " + err.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportResult(null);
    setErrorMessage(null);

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const data = new Uint8Array(buffer);
        // Robust binary array reading
        const wb = XLSX.read(data, { type: "array" });

        setRawWorkbook(wb);
        setSheetNames(wb.SheetNames);

        const firstSheet = wb.SheetNames[0];
        setSelectedSheet(firstSheet);
        processSheet(wb, firstSheet);
      } catch (err: any) {
        console.error("Error reading file:", err);
        setErrorMessage("Format file tidak terbaca atau corrupt. Pastikan file berupa .xlsx, .xls, atau .csv.");
      }
    };

    reader.onerror = () => {
      setErrorMessage("Gagal membaca file dari komputer. Silakan coba lagi.");
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSheetChange = (sheetName: string) => {
    setSelectedSheet(sheetName);
    if (rawWorkbook) {
      processSheet(rawWorkbook, sheetName);
    }
  };

  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) return;
    setIsImporting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/customers/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: parsedRows,
          duplicateStrategy,
          sisterCompany: selectedSisterCompany !== "AUTO" ? selectedSisterCompany : undefined,
          columnMapping,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setImportResult({ imported: data.imported, skipped: data.skipped, total: data.total });
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setErrorMessage(data.error || "Gagal mengimpor data ke server.");
      }
    } catch (err: any) {
      console.error("Import error:", err);
      setErrorMessage("Terjadi kendala jaringan saat mengimpor data.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadSampleFile = (type: "xlsx" | "csv") => {
    const sample = [
      {
        "Nama Bisnis": "Ubud Artisan Coffee Roastery",
        "Sister Company": "EZY Hospitality",
        "Nama Contact": "Wayan Subawa",
        "No HP": "+62 812-9988-1122",
        "Email": "info@ubudroastery.com",
        "Kota": "Ubud",
        "Kategori": "Cafe",
        "Alamat": "Jl. Monkey Forest No. 24",
      },
      {
        "Nama Bisnis": "Canggu Ocean View Villa",
        "Sister Company": "EZY Property & Villas",
        "Nama Contact": "Sarah Wilson",
        "No HP": "+62 811-3344-5566",
        "Email": "stay@cangguvilla.com",
        "Kota": "Canggu",
        "Kategori": "Villa",
        "Alamat": "Jl. Nelayan No. 10",
      },
      {
        "Nama Bisnis": "Seminyak Beach Surf Academy",
        "Sister Company": "EZY Travel & Tours",
        "Nama Contact": "Made Artana",
        "No HP": "+62 878-5544-3322",
        "Email": "surf@seminyaksurfacademy.com",
        "Kota": "Seminyak",
        "Kategori": "Surf Camp",
        "Alamat": "Pantai Double Six",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Database Prospek");

    if (type === "xlsx") {
      XLSX.writeFile(wb, "Template_Import_CRM_EZY.xlsx");
    } else {
      XLSX.writeFile(wb, "Template_Import_CRM_EZY.csv", { bookType: "csv" });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Upload Box (Design Section 36) */}
      <div className="bg-white rounded-xl p-8 border border-[#1C1B18]/10 shadow-xs flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-full bg-[#FCFBF0] border border-[#1C1B18]/10 flex items-center justify-center text-[#FF7800] mb-4">
          <UploadCloud size={28} />
        </div>

        <h3 className="text-base font-bold text-[#1C1B18] tracking-tight">
          Upload File Excel (.xlsx, .xls) atau CSV
        </h3>
        <p className="text-xs text-[#1C1B18]/60 mt-1 max-w-md">
          Sistem otomatis mendeteksi baris header dan memetakan kolom database bisnis Anda secara cerdas.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 rounded-lg bg-[#FF7800] text-white text-xs font-semibold hover:bg-[#e66c00] transition-colors shadow-xs cursor-pointer flex items-center gap-2"
          >
            <UploadCloud size={15} />
            <span>Pilih File Excel / CSV</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadSampleFile("xlsx")}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#1C1B18]/20 text-[#1C1B18] text-xs font-semibold hover:bg-[#FCFBF0] transition-colors cursor-pointer"
              title="Download Template Format Excel"
            >
              <Download size={13} className="text-[#002236]" />
              <span>Download Template Excel</span>
            </button>
            <button
              onClick={() => handleDownloadSampleFile("csv")}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#1C1B18]/20 text-[#1C1B18] text-xs font-semibold hover:bg-[#FCFBF0] transition-colors cursor-pointer"
              title="Download Template Format CSV"
            >
              <Download size={13} className="text-[#002236]" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {fileName && (
          <div className="mt-4 px-3.5 py-1.5 rounded-full bg-[#FCFBF0] border border-[#1C1B18]/15 flex items-center gap-2 text-xs font-medium text-[#1C1B18]">
            <FileSpreadsheet size={15} className="text-[#1A75FF]" />
            <span className="font-semibold">{fileName}</span>
            {parsedRows.length > 0 && (
              <span className="text-[11px] px-2 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                {parsedRows.length} baris terbaca
              </span>
            )}
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 text-left max-w-lg">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Configuration & Preview Section */}
      {parsedRows.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-[#1C1B18]/10 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1C1B18]/8">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#1C1B18]">
                Konfigurasi Import & Pemetaan Kolom
              </h4>
              <p className="text-xs text-[#1C1B18]/60 mt-0.5">
                Total <span className="font-number font-bold text-sm text-[#FF7800]">{parsedRows.length}</span> baris data siap dimasukkan ke CRM EZY.
              </p>
            </div>

            {/* Sheet Selector (If multiple sheets) */}
            {sheetNames.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#1C1B18]/70">Pilih Sheet:</span>
                <div className="relative">
                  <select
                    value={selectedSheet}
                    onChange={(e) => handleSheetChange(e.target.value)}
                    className="h-8 pl-3 pr-8 text-xs font-semibold bg-[#FCFBF0] border border-[#1C1B18]/20 rounded-lg focus:outline-none focus:border-[#FF7800] text-[#002236] appearance-none cursor-pointer"
                  >
                    {sheetNames.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#1C1B18]/40 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* Batch Destination & Duplicate Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FCFBF0]/60 p-4 rounded-xl border border-[#1C1B18]/10">
            {/* Sister Company Dropdown */}
            <div>
              <label className="block text-xs font-bold text-[#1C1B18] mb-1.5 flex items-center gap-1.5">
                <Building2 size={14} className="text-[#FF7800]" />
                <span>Asal Database Sister Company:</span>
              </label>
              <CustomDropdown
                value={selectedSisterCompany}
                onChange={setSelectedSisterCompany}
                options={[
                  { value: "AUTO", label: "✨ Otomatis (Gunakan kolom di file jika ada)" },
                  ...sisterCompanies.map((sc) => ({
                    value: sc.name,
                    label: `🏢 ${sc.name}`,
                  })),
                ]}
                className="w-full"
                buttonClassName="w-full h-10"
                menuWidth="w-full"
              />
              <p className="text-[11px] text-[#1C1B18]/55 mt-1">
                {selectedSisterCompany === "AUTO"
                  ? "Sistem akan membaca kolom Sister Company per baris di file."
                  : `Semua ${parsedRows.length} data ini akan ditandai berasal dari ${selectedSisterCompany}.`}
              </p>
            </div>

            {/* Duplicate strategy */}
            <div>
              <label className="block text-xs font-bold text-[#1C1B18] mb-1.5 flex items-center gap-1.5">
                <Check size={14} className="text-[#1A75FF]" />
                <span>Penanganan Data Duplikat (Nama & Kota):</span>
              </label>
              <CustomDropdown
                value={duplicateStrategy}
                onChange={(val) => setDuplicateStrategy(val as any)}
                options={[
                  { value: "SKIP", label: "Skip existing (Aman - lewati jika sudah ada)" },
                  { value: "MERGE", label: "Merge / update data kontak" },
                  { value: "CREATE", label: "Buat baru sebagai data terpisah" },
                ]}
                className="w-full"
                buttonClassName="w-full h-10"
                menuWidth="w-full"
              />
              <p className="text-[11px] text-[#1C1B18]/55 mt-1">
                Mencegah data bisnis yang sama masuk berulang kali ke pipeline sales.
              </p>
            </div>
          </div>

          {/* Interactive Column Mapping Box */}
          <div className="p-4 rounded-xl border border-[#1C1B18]/15 bg-white space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1C1B18]/8">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={15} className="text-[#FF7800]" />
                <span className="text-xs font-bold text-[#1C1B18]">Pemetaan Kolom Excel ke Kolom CRM:</span>
              </div>
              <span className="text-[11px] text-[#1C1B18]/50">
                Sistem telah mencocokkan otomatis. Anda dapat mengubah pilihan di bawah jika nama kolom berbeda.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
              {FIELD_DEFINITIONS.map((field) => {
                const currentVal = columnMapping[field.key] || "NONE";
                const isSelected = currentVal !== "NONE";

                return (
                  <div key={field.key} className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#1C1B18] flex items-center justify-between">
                      <span>{field.label} {field.required && <strong className="text-rose-500">*</strong>}</span>
                      {isSelected && <span className="text-[9px] text-emerald-600 font-bold">Terhubung</span>}
                    </label>
                    <div className="relative">
                      <select
                        value={currentVal}
                        onChange={(e) => setColumnMapping({ ...columnMapping, [field.key]: e.target.value })}
                        className={`w-full h-8 pl-2.5 pr-7 text-[11px] rounded-lg border appearance-none cursor-pointer focus:outline-none focus:border-[#FF7800] ${
                          isSelected
                            ? "bg-white border-[#1C1B18]/25 text-[#1C1B18] font-medium"
                            : "bg-[#FCFBF0]/40 border-dashed border-[#1C1B18]/20 text-[#1C1B18]/50"
                        }`}
                      >
                        <option value="NONE">— Kosong / Tidak Dipetakan —</option>
                        {detectedColumns.map((col) => (
                          <option key={col} value={col}>
                            Kolom: {col}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#1C1B18]/40 pointer-events-none" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Preview Table with Live Mapped Columns */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#1C1B18]">
              <span>Pratinjau Hasil Pemetaan (10 Baris Pertama):</span>
              <span className="text-[11px] text-[#1C1B18]/50">Menampilkan nilai asli dari kolom terpilih</span>
            </div>

            <div className="overflow-x-auto max-h-72 border border-[#1C1B18]/15 rounded-xl shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-[#FCFBF0] border-b border-[#1C1B18]/15 text-[10.5px] font-bold uppercase tracking-wider text-[#1C1B18]/60">
                  <tr>
                    <th className="py-2.5 px-3">Nama Bisnis</th>
                    <th className="py-2.5 px-3">Sister Company</th>
                    <th className="py-2.5 px-3">No. HP / WA</th>
                    <th className="py-2.5 px-3">Kontak / PIC</th>
                    <th className="py-2.5 px-3">Kota</th>
                    <th className="py-2.5 px-3">Kategori</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1B18]/8">
                  {parsedRows.slice(0, 10).map((row, idx) => {
                    const bName = columnMapping["business_name"] !== "NONE" && columnMapping["business_name"]
                      ? row[columnMapping["business_name"]]
                      : (row.business_name || row["Nama Bisnis"] || row["Business Name"] || "—");

                    const rowPhone = columnMapping["phone"] !== "NONE" && columnMapping["phone"]
                      ? row[columnMapping["phone"]]
                      : (row.phone || row["No HP"] || "—");

                    const rowContact = columnMapping["contact_name"] !== "NONE" && columnMapping["contact_name"]
                      ? row[columnMapping["contact_name"]]
                      : (row.contact_name || row["Nama Contact"] || "—");

                    const rowCity = columnMapping["city"] !== "NONE" && columnMapping["city"]
                      ? row[columnMapping["city"]]
                      : (row.city || row["Kota"] || "Bali");

                    const rowCat = columnMapping["category"] !== "NONE" && columnMapping["category"]
                      ? row[columnMapping["category"]]
                      : (row.business_category || row["Kategori"] || "General");

                    const rowSister = selectedSisterCompany !== "AUTO"
                      ? selectedSisterCompany
                      : (columnMapping["sister_company"] !== "NONE" && columnMapping["sister_company"] && row[columnMapping["sister_company"]]
                          ? row[columnMapping["sister_company"]]
                          : (row.sister_company || row["Sister Company"] || "EZY Property & Villas"));

                    return (
                      <tr key={idx} className="hover:bg-[#FCFBF0]/50 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-[#1C1B18]">
                          {bName ? (
                            <span>{bName}</span>
                          ) : (
                            <span className="text-rose-500 italic text-[11px]">Nama kosong</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-[#c25900] font-medium">
                          <span className="inline-flex items-center gap-1 bg-[#FF7800]/10 px-2 py-0.5 rounded text-[10.5px]">
                            <Building2 size={11} />
                            <span>{rowSister}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-number text-[#1C1B18]/70">
                          {rowPhone || "—"}
                        </td>
                        <td className="py-2.5 px-3 text-[#1C1B18]/70">
                          {rowContact || "—"}
                        </td>
                        <td className="py-2.5 px-3 text-[#1C1B18]/70">
                          {rowCity || "—"}
                        </td>
                        <td className="py-2.5 px-3 text-[#1C1B18]/70">
                          {rowCat || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setParsedRows([]);
                setFileName(null);
                setDetectedColumns([]);
                setErrorMessage(null);
              }}
              className="px-4 py-2 rounded-lg bg-white border border-[#1C1B18]/20 text-[#1C1B18] text-xs font-semibold hover:bg-[#FCFBF0] transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              disabled={isImporting || parsedRows.length === 0}
              onClick={handleExecuteImport}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#FF7800] text-white text-xs font-bold hover:bg-[#e66c00] transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <span>{isImporting ? "Mengimpor data..." : `Proses & Import ${parsedRows.length} Prospek`}</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {importResult && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Check size={18} className="text-emerald-600 shrink-0" />
                <span>
                  Berhasil mengimpor <strong>{importResult.imported}</strong> data prospek ke database CRM. (Dilewati duplikat: {importResult.skipped} dari total {importResult.total}).
                </span>
              </div>
              <button 
                onClick={() => router.push("/customers")}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shrink-0 cursor-pointer shadow-2xs"
              >
                Lihat di Daftar Customer →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
