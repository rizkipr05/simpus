import { useState } from "react";

const initialState = {
  patientId: "",
  visitDate: "",
  complaint: "",
  diagnosis: "",
  treatment: "",
  notes: "",
};

export default function MedicalRecordForm({ patients, onSave }) {
  const [form, setForm] = useState(initialState);

  return (
    <form
      className="panel form-grid"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(form);
        setForm(initialState);
      }}
    >
      <div className="panel-header">
        <div>
          <h2>Input Rekam Medis</h2>
          <p className="muted">Riwayat pemeriksaan mengikuti data pasien yang tersimpan lokal.</p>
        </div>
      </div>

      <div className="input-grid">
        <label>
          Pasien
          <select
            required
            value={form.patientId}
            onChange={(event) => setForm((prev) => ({ ...prev, patientId: event.target.value }))}
          >
            <option value="">Pilih pasien</option>
            {patients.map((patient) => (
              <option key={patient._id} value={patient._id}>
                {patient.name} - {patient.nik}
              </option>
            ))}
          </select>
        </label>

        <label>
          Tanggal Kunjungan
          <input
            type="date"
            required
            value={form.visitDate}
            onChange={(event) => setForm((prev) => ({ ...prev, visitDate: event.target.value }))}
          />
        </label>

        <label className="full-width">
          Keluhan
          <textarea
            rows="3"
            required
            value={form.complaint}
            onChange={(event) => setForm((prev) => ({ ...prev, complaint: event.target.value }))}
          />
        </label>

        <label className="full-width">
          Diagnosis
          <textarea
            rows="3"
            required
            value={form.diagnosis}
            onChange={(event) => setForm((prev) => ({ ...prev, diagnosis: event.target.value }))}
          />
        </label>

        <label className="full-width">
          Tindakan / Terapi
          <textarea
            rows="3"
            required
            value={form.treatment}
            onChange={(event) => setForm((prev) => ({ ...prev, treatment: event.target.value }))}
          />
        </label>

        <label className="full-width">
          Catatan
          <textarea
            rows="2"
            value={form.notes}
            onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
          />
        </label>
      </div>

      <button className="primary-button" type="submit">
        Simpan Rekam Medis
      </button>
    </form>
  );
}
