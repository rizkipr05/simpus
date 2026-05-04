import { useEffect, useMemo, useState } from "react";
import AppShell from "./components/AppShell";
import DashboardPage from "./components/DashboardPage";
import LoginForm from "./components/LoginForm";
import MedicalRecordForm from "./components/MedicalRecordForm";
import MedicalRecordsPage from "./components/MedicalRecordsPage";
import PageHeader from "./components/PageHeader";
import PatientsPage from "./components/PatientsPage";
import PatientForm from "./components/PatientForm";
import ProfilePage from "./components/ProfilePage";
import SyncStatusCard from "./components/SyncStatusCard";
import UserManagementPage from "./components/UserManagementPage";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { loginRequest } from "./lib/api";
import { offlineUsers } from "./lib/offlineUsers";
import { clearSession, loadSession, saveSession } from "./lib/session";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID");
}

function generateId(prefix) {
  return `${prefix}:${crypto.randomUUID()}`;
}

function loadDbModule() {
  return import("./lib/db");
}

function createUserDoc(user, updatedBy = "system") {
  return {
    _id: `user:${user.username}`,
    type: "user",
    id: user.id || `user-${user.username}`,
    username: user.username,
    name: user.name,
    role: user.role,
    password: user.password,
    updatedBy,
  };
}

const roleConfigs = {
  Admin: {
    panelTitle: "Panel Admin",
    panelDescription: "Kelola pasien, rekam medis, akun user, dan sinkronisasi sistem.",
    defaultPage: "dashboard",
    pages: [
      { id: "dashboard", label: "Dashboard" },
      { id: "patients", label: "Data Pasien" },
      { id: "patient-form", label: "Tambah / Edit Pasien" },
      { id: "record-entry", label: "Input Rekam Medis" },
      { id: "record-history", label: "Riwayat Pemeriksaan" },
      { id: "users", label: "Manage User" },
      { id: "profile", label: "Profil" },
    ],
  },
  Perawat: {
    panelTitle: "Panel Perawat",
    panelDescription: "Fokus pada pelayanan pasien, pencatatan medis, dan pembaruan profil.",
    defaultPage: "dashboard",
    pages: [
      { id: "dashboard", label: "Dashboard" },
      { id: "patients", label: "Daftar Pasien" },
      { id: "record-entry", label: "Input Rekam Medis" },
      { id: "record-history", label: "Riwayat Pemeriksaan" },
      { id: "profile", label: "Profil" },
    ],
  },
};

export default function App() {
  const online = useOnlineStatus();
  const [session, setSession] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [recordHistoryTitle, setRecordHistoryTitle] = useState("Seluruh Riwayat Pemeriksaan");
  const [syncState, setSyncState] = useState({
    label: "Belum sinkron",
    detail: "Menunggu aktivitas",
    lastSync: "",
  });
  const [appError, setAppError] = useState("");
  const roleConfig = roleConfigs[session?.user?.role] || roleConfigs.Perawat;
  const canManagePatients = session?.user?.role === "Admin";

  function isValidSession(value) {
    return Boolean(value?.user?.username && value?.user?.role && value?.user?.name);
  }

  async function ensureDefaultUsers() {
    const { listDocuments, putDocument } = await loadDbModule();
    const existingUsers = await listDocuments("user");

    if (existingUsers.length > 0) {
      return existingUsers;
    }

    const defaultUsers = offlineUsers.map((user) => createUserDoc(user));
    await Promise.all(defaultUsers.map((user) => putDocument(user)));
    return listDocuments("user");
  }

  async function refreshData() {
    const { listDocuments } = await loadDbModule();
    const [patientDocs, recordDocs, userDocs] = await Promise.all([
      listDocuments("patient"),
      listDocuments("medical-record"),
      ensureDefaultUsers(),
    ]);
    setPatients(patientDocs);
    setRecords(recordDocs);
    setUsers(userDocs);
  }

  async function runSync() {
    if (!navigator.onLine) {
      setSyncState((prev) => ({
        ...prev,
        label: "Offline",
        detail: "Data aman di penyimpanan lokal.",
      }));
      return;
    }

    setSyncState((prev) => ({
      ...prev,
      label: "Sinkronisasi berjalan",
      detail: "Mengirim dan menarik perubahan terbaru.",
    }));

    try {
      const { syncNow } = await loadDbModule();
      await syncNow(() => {
        setSyncState((prev) => ({
          ...prev,
          detail: "Perubahan terdeteksi.",
        }));
      });
      await refreshData();
      setSyncState({
        label: "Sinkron berhasil",
        detail: "Database lokal dan server sudah selaras.",
        lastSync: formatDate(new Date().toISOString()),
      });
    } catch (error) {
      setSyncState((prev) => ({
        ...prev,
        label: "Sinkron gagal",
        detail: error.message || "Periksa koneksi atau backend.",
      }));
    }
  }

  useEffect(() => {
    let syncHandler;

    try {
      const savedSession = loadSession();
      if (isValidSession(savedSession)) {
        setSession(savedSession);
        setActivePage(roleConfigs[savedSession.user.role]?.defaultPage || "dashboard");
      } else {
        clearSession();
      }
    } catch {
      clearSession();
      setSession(null);
    }

    loadDbModule()
      .then(({ ensureIndexes }) => ensureIndexes())
      .then(refreshData)
      .catch((error) => {
        console.error("Gagal menyiapkan database lokal", error);
        setAppError("Database lokal gagal dimuat. Muat ulang halaman atau hapus data browser.");
      });

    loadDbModule()
      .then(({ watchContinuousSync }) => {
        syncHandler = watchContinuousSync(() => {
          setSyncState((prev) => ({
            ...prev,
            label: "Sinkron aktif",
            detail: "Perubahan direplikasi otomatis.",
            lastSync: formatDate(new Date().toISOString()),
          }));
          refreshData();
        });
      })
      .catch((error) => {
        console.error("Gagal memulai sinkronisasi", error);
        setAppError("Sinkronisasi lokal gagal dijalankan.");
      });

    return () => {
      syncHandler?.cancel?.();
    };
  }, []);

  useEffect(() => {
    if (online) {
      runSync();
    }
  }, [online]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const allowedPageIds = roleConfig.pages.map((page) => page.id);
    if (!allowedPageIds.includes(activePage)) {
      setActivePage(roleConfig.defaultPage);
    }
  }, [session, activePage, roleConfig]);

  const filteredPatients = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return patients;
    }

    return patients.filter((patient) =>
      [patient.name, patient.nik, patient.phone].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(keyword)
      )
    );
  }, [patients, search]);

  async function handleLogin(credentials) {
    setLoginLoading(true);
    setLoginError("");

    try {
      const payload = await loginRequest(credentials);
      saveSession(payload);
      setSession(payload);
      setActivePage(roleConfigs[payload.user.role]?.defaultPage || "dashboard");
    } catch (error) {
      if (error.isNetworkError) {
        const { listDocuments } = await loadDbModule();
        const localUsers = await listDocuments("user");
        const fallbackUsers = localUsers.length > 0 ? localUsers : offlineUsers;
        const localUser = fallbackUsers.find(
          (user) =>
            user.username === credentials.username && user.password === credentials.password
        );

        if (localUser) {
          const { putDocument } = await loadDbModule();
          await putDocument(createUserDoc(localUser, localUser.username));

          const offlineSession = {
            token: "offline-session",
            user: {
              id: localUser.id,
              username: localUser.username,
              role: localUser.role,
              name: localUser.name,
            },
            offlineMode: true,
          };

          saveSession(offlineSession);
          setSession(offlineSession);
          setActivePage(roleConfigs[offlineSession.user.role]?.defaultPage || "dashboard");
          setSyncState({
            label: "Mode offline",
            detail: "Login lokal aktif. Sinkronisasi akan berjalan saat backend tersedia.",
            lastSync: "",
          });
          return;
        }
      }

      setLoginError(error.message || "Login gagal.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleSavePatient(form) {
    const { putDocument } = await loadDbModule();
    const doc = {
      ...(selectedPatient || {}),
      _id: selectedPatient?._id || generateId("patient"),
      type: "patient",
      ...form,
      updatedBy: session.user.username,
    };

    await putDocument(doc);
    setSelectedPatient(null);
    await refreshData();
    await runSync();
    setActivePage("patients");
  }

  async function handleSaveMedicalRecord(form) {
    const { putDocument } = await loadDbModule();
    const patient = patients.find((item) => item._id === form.patientId);

    await putDocument({
      _id: generateId("medical-record"),
      type: "medical-record",
      ...form,
      patientName: patient?.name || "",
      updatedBy: session.user.username,
    });

    await refreshData();
    await runSync();
    setRecordHistoryTitle(`Riwayat Pemeriksaan ${patient?.name || "Pasien"}`);
    setActivePage("record-history");
  }

  async function handleOpenHistory(patientId) {
    const { listRecordsByPatient } = await loadDbModule();
    const patientRecords = await listRecordsByPatient(patientId);
    const patient = patients.find((item) => item._id === patientId);
    setRecords(patientRecords);
    setRecordHistoryTitle(`Riwayat Pemeriksaan ${patient?.name || "Pasien"}`);
    setActivePage("record-history");
  }

  async function handleOpenAllHistory() {
    await refreshData();
    setRecordHistoryTitle("Seluruh Riwayat Pemeriksaan");
    setActivePage("record-history");
  }

  async function handleSaveUser(form) {
    const { putDocument } = await loadDbModule();
    const username = selectedUser?.username || form.username.trim();

    await putDocument({
      ...(selectedUser || {}),
      _id: selectedUser?._id || `user:${username}`,
      type: "user",
      id: selectedUser?.id || `user-${username}`,
      username,
      name: form.name.trim(),
      role: form.role,
      password: form.password,
      updatedBy: session.user.username,
    });

    setSelectedUser(null);
    await refreshData();
    await runSync();
    setActivePage("users");
  }

  async function handleSaveProfile(form) {
    const { putDocument } = await loadDbModule();
    const currentUser = users.find((user) => user.username === session.user.username) || {
      _id: `user:${session.user.username}`,
      type: "user",
      id: session.user.id,
      username: session.user.username,
      role: session.user.role,
      name: session.user.name,
      password: "",
    };

    const updatedUser = {
      ...currentUser,
      name: form.name.trim(),
      updatedBy: session.user.username,
    };

    if (form.password) {
      updatedUser.password = form.password;
    }

    await putDocument(updatedUser);

    const nextSession = {
      ...session,
      user: {
        ...session.user,
        name: updatedUser.name,
      },
    };

    saveSession(nextSession);
    setSession(nextSession);
    await refreshData();
    await runSync();
  }

  if (!session) {
    return <LoginForm onSubmit={handleLogin} error={loginError} loading={loginLoading} />;
  }

  if (appError) {
    return (
      <div className="login-shell">
        <div className="login-card">
          <div>
            <p className="eyebrow">SIMPUS</p>
            <h1>Aplikasi Gagal Dimuat</h1>
            <p className="error-text">{appError}</p>
          </div>
          <button
            className="primary-button"
            type="button"
            onClick={() => {
              clearSession();
              window.location.reload();
            }}
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      session={session}
      pages={roleConfig.pages}
      activePage={activePage}
      onNavigate={setActivePage}
      onLogout={() => {
        clearSession();
        setSession(null);
      }}
      panelTitle={roleConfig.panelTitle}
      panelDescription={roleConfig.panelDescription}
    >
      {activePage === "dashboard" ? (
        <>
          <PageHeader
            title={session.user.role === "Admin" ? "Dashboard Admin" : "Dashboard Perawat"}
            description={
              session.user.role === "Admin"
                ? "Ringkasan data untuk pengelolaan operasional, user, dan sinkronisasi sistem."
                : "Ringkasan pelayanan untuk membantu proses pemeriksaan pasien."
            }
          />
          <SyncStatusCard online={online} syncState={syncState} onManualSync={runSync} />
          <DashboardPage
            patients={patients}
            records={records}
            syncState={syncState}
            online={online}
            role={session.user.role}
          />
        </>
      ) : null}

      {activePage === "patients" ? (
        <>
          <PageHeader
            title={canManagePatients ? "Data Pasien Admin" : "Daftar Pasien Perawat"}
            description={
              canManagePatients
                ? "Admin dapat menambah, mengubah, dan meninjau data pasien."
                : "Perawat dapat mencari pasien dan membuka riwayat pemeriksaan."
            }
          />
          <SyncStatusCard online={online} syncState={syncState} onManualSync={runSync} />
          <PatientsPage
            patients={filteredPatients}
            search={search}
            onSearchChange={setSearch}
            onEdit={(patient) => {
              setSelectedPatient(patient);
              setActivePage("patient-form");
            }}
            onOpenHistory={handleOpenHistory}
            onGoToCreate={() => {
              setSelectedPatient(null);
              setActivePage("patient-form");
            }}
            canManage={canManagePatients}
          />
        </>
      ) : null}

      {activePage === "patient-form" && canManagePatients ? (
        <>
          <PageHeader
            title={selectedPatient ? "Edit Pasien" : "Tambah Pasien"}
            description="Halaman khusus admin untuk pengelolaan data pasien."
            action={
              <button
                className="secondary-button"
                type="button"
                onClick={() => {
                  setSelectedPatient(null);
                  setActivePage("patients");
                }}
              >
                Kembali ke Daftar
              </button>
            }
          />
          <SyncStatusCard online={online} syncState={syncState} onManualSync={runSync} />
          <PatientForm
            selectedPatient={selectedPatient}
            onSave={handleSavePatient}
            onCancel={() => {
              setSelectedPatient(null);
              setActivePage("patients");
            }}
          />
        </>
      ) : null}

      {activePage === "record-entry" ? (
        <>
          <PageHeader
            title="Input Rekam Medis"
            description="Form pencatatan pemeriksaan dipisahkan dari halaman riwayat agar lebih fokus."
            action={
              <button className="secondary-button" type="button" onClick={handleOpenAllHistory}>
                Lihat Riwayat
              </button>
            }
          />
          <SyncStatusCard online={online} syncState={syncState} onManualSync={runSync} />
          <MedicalRecordForm patients={patients} onSave={handleSaveMedicalRecord} />
        </>
      ) : null}

      {activePage === "record-history" ? (
        <>
          <PageHeader
            title="Riwayat Pemeriksaan"
            description="Halaman ini khusus untuk peninjauan rekam medis yang sudah tercatat."
            action={
              <button className="secondary-button" type="button" onClick={handleOpenAllHistory}>
                Tampilkan Semua
              </button>
            }
          />
          <SyncStatusCard online={online} syncState={syncState} onManualSync={runSync} />
          <MedicalRecordsPage
            records={records}
            title={recordHistoryTitle}
            description="Riwayat pemeriksaan pasien tersimpan lokal dan dapat dibuka kembali kapan saja."
          />
        </>
      ) : null}

      {activePage === "users" && canManagePatients ? (
        <>
          <PageHeader
            title="Manage User"
            description="Admin mengelola akun login untuk admin lain maupun perawat."
          />
          <SyncStatusCard online={online} syncState={syncState} onManualSync={runSync} />
          <UserManagementPage
            users={users}
            selectedUser={selectedUser}
            onEdit={(user) => setSelectedUser(user)}
            onSave={handleSaveUser}
            onCancelEdit={() => setSelectedUser(null)}
          />
        </>
      ) : null}

      {activePage === "profile" ? (
        <>
          <PageHeader
            title="Profil"
            description="Perbarui nama akun dan password dari halaman profil pengguna."
          />
          <SyncStatusCard online={online} syncState={syncState} onManualSync={runSync} />
          <ProfilePage session={session} onSave={handleSaveProfile} />
        </>
      ) : null}
    </AppShell>
  );
}
