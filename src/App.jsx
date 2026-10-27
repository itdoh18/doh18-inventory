import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

function App() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // ควบคุมการแสดงผลป็อปอัพฟอร์ม (Modal)
  const [showModal, setShowModal] = useState(false);

  // ควบคุมการแสดงผลปุ่มเลื่อนขึ้นด้านบน
  const [showScrollTop, setShowScrollTop] = useState(false);

  // ฟอร์มสำหรับ เพิ่ม/แก้ไข
  const [formData, setFormData] = useState({
    section: "",
    asset_number: "",
    equipment_type: "เครื่องคอมพิวเตอร์",
    purchase_year: new Date().getFullYear() + 543,
    responsible_person: "",
    purchase_type: "",
    notes: "",
  });

  const [editingId, setEditingId] = useState(null);

  // ช่องค้นหาเดียวแบบครอบคลุมทุกอย่าง
  const [searchTerm, setSearchTerm] = useState("");

  const equipmentTypes = [
    "เครื่องคอมพิวเตอร์",
    "คอมพิวเตอร์โน๊ตบุ๊ก",
    "คอมพิวเตอร์แท็ปเล็ต",
    "เครื่องพิมพ์สี",
    "เครื่องพิมพ์ขาวดำ",
    "เครื่องสำรองไฟฟ้า",
    "เครื่องสแกนเนอร์",
    "จอภาพ",
    "อุกปรณ์กระจายสัญญาณ",
  ];
  const purchaseTypes = ["ซื้อเพิ่ม", "ทดแทน"];

  // ดึงข้อมูลจาก Supabase และฟังการเลื่อนหน้าจอเมื่อเปิดเว็บ
  useEffect(() => {
    fetchAssets();

    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ฟังก์ชันเลื่อนหน้าจอขึ้นด้านบนสุด
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  async function fetchAssets() {
    setLoading(true);
    const { data, error } = await supabase
      .from("computer_assets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching assets:", error);
    } else {
      setAssets(data || []);
    }
    setLoading(false);
  }

  // บันทึกข้อมูล (เพิ่ม หรือ แก้ไข)
  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.section || !formData.asset_number) {
      alert('กรุณากรอก "ส่วนฝ่าย" และ "หมายเลขครุภัณฑ์" ให้ครบถ้วน');
      return;
    }

    if (editingId) {
      // แก้ไขข้อมูล
      const { error } = await supabase
        .from("computer_assets")
        .update(formData)
        .eq("id", editingId);

      if (error) {
        alert("เกิดข้อผิดพลาดในการแก้ไข: " + error.message);
      } else {
        alert("แก้ไขข้อมูลสำเร็จ!");
        setShowModal(false);
        resetForm();
        fetchAssets();
      }
    } else {
      // เพิ่มข้อมูลใหม่
      const { error } = await supabase
        .from("computer_assets")
        .insert([formData]);

      if (error) {
        alert("เกิดข้อผิดพลาดในการเพิ่ม: " + error.message);
      } else {
        alert("เพิ่มครุภัณฑ์สำเร็จ!");
        setShowModal(false);
        resetForm();
        fetchAssets();
      }
    }
  }

  function resetForm() {
    setFormData({
      section: "",
      asset_number: "",
      equipment_type: "เครื่องคอมพิวเตอร์",
      purchase_year: new Date().getFullYear() + 543,
      responsible_person: "",
      purchase_type: "",
      notes: "",
    });
    setEditingId(null);
  }

  // เปิดป็อปอัพเพื่อเพิ่มข้อมูลใหม่
  function handleOpenAddModal() {
    resetForm();
    setShowModal(true);
  }

  // นำข้อมูลมาใส่ฟอร์มและเปิดป็อปอัพเพื่อแก้ไข
  function handleEdit(item) {
    setEditingId(item.id);
    setFormData({
      section: item.section,
      asset_number: item.asset_number,
      equipment_type: item.equipment_type,
      purchase_year: item.purchase_year,
      responsible_person: item.responsible_person || "",
      purchase_type: item.purchase_type || "",
      notes: item.notes || "",
    });
    setShowModal(true);
  }

  // ลบข้อมูล
  async function handleDelete(id) {
    if (window.confirm("คุณต้องการลบรายการนี้ใช่หรือไม่?")) {
      const { error } = await supabase
        .from("computer_assets")
        .delete()
        .eq("id", id);

      if (error) {
        alert("เกิดข้อผิดพลาดในการลบ: " + error.message);
      } else {
        fetchAssets();
      }
    }
  }

  // ค้นหาแบบครอบคลุมทุกลักษณะข้อมูลในช่องเดียว
  const filteredAssets = assets.filter((item) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    return (
      (item.section && item.section.toLowerCase().includes(term)) ||
      (item.asset_number && item.asset_number.toLowerCase().includes(term)) ||
      (item.equipment_type &&
        item.equipment_type.toLowerCase().includes(term)) ||
      (item.responsible_person &&
        item.responsible_person.toLowerCase().includes(term)) ||
      (item.purchase_type && item.purchase_type.toLowerCase().includes(term)) ||
      (item.notes && item.notes.toLowerCase().includes(term)) ||
      (item.purchase_year && item.purchase_year.toString().includes(term))
    );
  });

  // คำนวณจำนวนครุภัณฑ์ทั้งหมด
  const totalCount = assets.length;
  const currentYear = 2569; // ปีปัจจุบัน (พ.ศ.)

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10 relative">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header และ Dashboard (ปรับให้รองรับมือถืออย่างสมบูรณ์ ไม่ทับกัน) */}
        <header className="bg-white shadow-xs border border-slate-100 rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col gap-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                ระบบจัดการครุภัณฑ์คอมพิวเตอร์
              </h1>
              <p className="text-slate-500 text-sm sm:text-base">
                สำนักงานทางหลวงที่ 18
              </p>
            </div>

            {/* ปุ่มเพิ่มครุภัณฑ์ (แสดงเต็มความกว้างบนมือถือ จัดเรียงสวยงาม) */}
            <button
              onClick={handleOpenAddModal}
              className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition font-medium text-base flex items-center justify-center gap-2.5 shadow-sm shrink-0"
            >
              <span className="text-xl leading-none">+</span> เพิ่มครุภัณฑ์ใหม่
            </button>
          </div>

          {/* แถบแสดงจำนวนครุภัณฑ์ทั้งหมด */}
          <div className="flex items-center justify-between bg-blue-50 border border-blue-100 px-5 py-3 rounded-2xl">
            <span className="text-sm font-semibold text-blue-600">
              ครุภัณฑ์ทั้งหมด
            </span>
            <div className="text-xl sm:text-2xl font-bold text-blue-700 flex items-baseline gap-1.5">
              <span>{totalCount}</span>
              <span className="text-xs sm:text-sm font-normal text-blue-500">
                รายการ
              </span>
            </div>
          </div>
        </header>

        {/* ช่องค้นหาอัจฉริยะช่องเดียว */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 text-lg">
              🔍
            </span>
            <input
              type="text"
              placeholder="ค้นหาได้ทุกข้อมูล เช่น ส่วนฝ่าย, หมายเลข, ประเภท..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-700 text-sm sm:text-base font-normal"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="w-full sm:w-auto text-sm sm:text-base text-rose-600 hover:bg-rose-50 px-5 py-3.5 rounded-xl transition font-medium shrink-0 text-center"
            >
              ล้างคำค้นหา
            </button>
          )}
        </div>

        {/* ตารางแสดงรายการครุภัณฑ์ (รองรับการเลื่อนดูบนมือถือแบบสมูท) */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-800 text-white text-xs sm:text-sm uppercase tracking-wider font-semibold">
                  <th className="p-4 whitespace-nowrap">ส่วนฝ่าย</th>
                  <th className="p-4 whitespace-nowrap">หมายเลขครุภัณฑ์</th>
                  <th className="p-4 whitespace-nowrap">ประเภท</th>
                  <th className="p-4 whitespace-nowrap">ปีที่ซื้อ</th>
                  <th className="p-4 whitespace-nowrap">อายุการใช้งาน</th>
                  <th className="p-4">ผู้รับผิดชอบ</th>
                  <th className="p-4 whitespace-nowrap">ประเภทจัดซื้อ</th>
                  <th className="p-4">หมายเหตุ</th>
                  <th className="p-4 text-center whitespace-nowrap">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm sm:text-base text-slate-700">
                {loading ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="text-center py-12 text-slate-400 text-base"
                    >
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                ) : filteredAssets.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="text-center py-12 text-slate-400 text-base"
                    >
                      ไม่พบข้อมูลครุภัณฑ์ที่ค้นหา
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((item) => {
                    const age = currentYear - item.purchase_year;
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="p-4 font-medium text-slate-800 whitespace-nowrap">
                          {item.section}
                        </td>
                        <td className="p-4 text-blue-600 font-semibold whitespace-nowrap">
                          {item.asset_number}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs sm:text-sm font-medium">
                            {item.equipment_type}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 whitespace-nowrap">
                          {item.purchase_year}
                        </td>
                        <td className="p-4 text-slate-600 whitespace-nowrap">
                          {age >= 0 ? `${age} ปี` : "ระบุปีไม่ถูกต้อง"}
                        </td>
                        <td className="p-4 text-slate-600">
                          {item.responsible_person || "-"}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          {item.purchase_type ? (
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs sm:text-sm font-medium ${item.purchase_type === "ซื้อเพิ่ม" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                            >
                              {item.purchase_type}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-4 text-slate-500 max-w-xs">
                          {item.notes || "-"}
                        </td>
                        <td className="p-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            {/* ปุ่มแก้ไข (ไอคอนดินสอ) */}
                            <button
                              onClick={() => handleEdit(item)}
                              title="แก้ไขข้อมูล"
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition shadow-xs text-sm"
                            >
                              ✏️
                            </button>
                            {/* ปุ่มลบ (ไอคอนถังขยะ) */}
                            <button
                              onClick={() => handleDelete(item.id)}
                              title="ลบข้อมูล"
                              className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition shadow-xs text-sm"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ปุ่มเลื่อนขึ้นด้านบนสุด */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          title="เลื่อนขึ้นด้านบน"
          className="fixed bottom-6 right-6 bg-blue-600 text-white w-12 h-12 rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center text-xl z-40 animate-fadeIn"
        >
          ⬆️
        </button>
      )}

      {/* Popup Modal สำหรับ เพิ่ม / แก้ไขข้อมูล */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-100">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                {editingId ? "✏️ แก้ไขข้อมูลครุภัณฑ์" : "➕ เพิ่มครุภัณฑ์ใหม่"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold p-1.5 rounded-xl hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              <div>
                <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">
                  ส่วนฝ่าย *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สารบัญ, บัญชี, สารสนเทศ"
                  value={formData.section}
                  onChange={(e) =>
                    setFormData({ ...formData, section: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-base"
                />
              </div>
              <div>
                <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">
                  หมายเลขครุภัณฑ์ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="XXXX-XXX-XXXXX-XX"
                  value={formData.asset_number}
                  onChange={(e) =>
                    setFormData({ ...formData, asset_number: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-base"
                />
              </div>
              <div>
                <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">
                  ประเภท
                </label>
                <select
                  value={formData.equipment_type}
                  onChange={(e) =>
                    setFormData({ ...formData, equipment_type: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700 text-base"
                >
                  {equipmentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">
                  ปีที่ซื้อ (พ.ศ.)
                </label>
                <input
                  type="number"
                  value={formData.purchase_year}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      purchase_year: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-base"
                />
              </div>
              <div>
                <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">
                  ผู้รับผิดชอบ
                </label>
                <input
                  type="text"
                  placeholder="ชื่อ-นามสกุล"
                  value={formData.responsible_person}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      responsible_person: e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-base"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">
                  ประเภทการจัดซื้อ
                </label>
                <select
                  value={formData.purchase_type}
                  onChange={(e) =>
                    setFormData({ ...formData, purchase_type: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700 text-base"
                >
                  <option value="">-- เลือกประเภทการจัดซื้อ --</option>
                  {purchaseTypes.map((pType) => (
                    <option key={pType} value={pType}>
                      {pType}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">
                  หมายเหตุ
                </label>
                <input
                  type="text"
                  placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-base"
                />
              </div>

              <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 justify-end mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto bg-slate-100 text-slate-700 px-6 py-3 rounded-xl hover:bg-slate-200 transition font-medium text-base text-center"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-blue-600 text-white px-7 py-3 rounded-xl hover:bg-blue-700 transition font-medium text-base shadow-sm text-center"
                >
                  {editingId ? "บันทึกการแก้ไข" : "บันทึกข้อมูลครุภัณฑ์"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
