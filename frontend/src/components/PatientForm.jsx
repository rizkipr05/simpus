import { useEffect, useState } from "react";

const emptyForm = {
  nik: "",
  name: "",
  birthDate: "",
  gender: "Laki-laki",
  phone: "",
  address: "",
};

export default function PatientForm({ selectedPatient, onSave, onCancel }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (selectedPatient) {
      setForm({
        nik: selectedPatient.nik || "",
        name: selectedPatient.name || "",
        birthDate: selectedPatient.birthDate || "",
        gender: selectedPatient.gender || "Laki-laki",
        phone: selectedPatient.phone || "",
        address: selectedPatient.address || "",
      });
      return;
    }

    setForm(emptyForm);
  }, [selectedPatient]);

  return (
    <form
      className="panel form-grid"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(form);
      }}
    >
      <div className="panel-header">
        <div>
          <h2>{selectedPatient ? "Edit Pasien" : "Tambah Pasien"}</h2>
          <p className="muted">Data tersimpan lokal dulu dan akan disinkronkan otomatis.</p>
        </div>
      </div>

      <div className="input-grid">
        <label>
          NIK
          <input
            required
            value={form.nik}
            onChange={(event) => setForm((prev) => ({ ...prev, nik: event.target.value }))}
          />
        </label>

        <label>
          Nama Lengkap
          <input
            required
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
        </label>

        <label>
          Tanggal Lahir
          <input
            type="date"
            required
            value={form.birthDate}
            onChange={(event) => setForm((prev) => ({ ...prev, birthDate: event.target.value }))}
          />
        </label>

        <label>
          Jenis Kelamin
          <select
            value={form.gender}
            onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
          >
            <option>Laki-laki</option>
            <option>Perempuan</option>
          </select>
        </label>

        <label>
          Telepon
          <input
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
          />
        </label>

        <label className="full-width">
          Alamat
          <textarea
            rows="3"
            value={form.address}
            onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
          />
        </label>
      </div>

      <div className="action-row">
        <button className="primary-button" type="submit">
          Simpan Pasien
        </button>
        {selectedPatient ? (
          <button className="secondary-button" type="button" onClick={onCancel}>
            Batal Edit
          </button>
        ) : null}
      </div>
    </form>
  );
}
