"use client";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { db, auth } from "../../lib/firebaseClient";
import { collection, getDocs, getDoc, doc, Timestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define a proper type for user profiles
interface Profile {
  email?: string;
  joinedAt?: Timestamp;
  name?: string;
  uid: string;
  unit?: string;
  lastLogin?: Timestamp;
  isAdmin?: boolean;
}

export default function Admin() {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [markedCounts, setMarkedCounts] = useState<Record<string, number>>({});
  const [sortKey, setSortKey] = useState<keyof Profile | "markedCount">("name");
  const [sortAsc, setSortAsc] = useState(true);
  const router = useRouter();

  // Fetch profile after login
  useEffect(() => {
    if (!user) {
      return;
    }

    const ref = doc(db, "profiles", user.uid);
    getDoc(ref)
      .then((snap) => {
        if (snap.exists() && snap.data().isAdmin) {
          console.log("Admin access granted");
          setIsAdmin(true);
          // Fetch all profiles
          const fetchProfiles = async () => {
            const snap = await getDocs(collection(db, "profiles"));
            const data: Profile[] = [];
            snap.forEach(doc => {
              if (doc.data().email && doc.data().email !== "jcyeoh@gmail.com") {
                data.push(doc.data() as Profile);
              }
            });
            setProfiles(data);

            // Fetch marked dates count for each user
            const checkinSnap = await getDocs(collection(db, "checkins"));
            const counts: Record<string, number> = {};
            checkinSnap.forEach(doc => {
              const d = doc.data();
              counts[doc.id] = Array.isArray(d.markedDates) ? d.markedDates.length : 0;
            });
            setMarkedCounts(counts);
          };
          fetchProfiles();
        } 
      })
  }, [user]);


  if (loading) return <p>Loading...</p>;
  if (!isAdmin) return <p>Access denied. Admins only.</p>;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/"); // redirect to root
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Sorting logic
  const sortedProfiles = [...profiles].sort((a, b) => {
  let aVal: string | number = "";
  let bVal: string | number = "";

  if (sortKey === "markedCount") {
    aVal = markedCounts[a.uid] ?? 0;
    bVal = markedCounts[b.uid] ?? 0;
  } else {
    // ✅ Safe because sortKey is keyof Profile
    aVal = (a[sortKey] as string | number | undefined) ?? "";
    bVal = (b[sortKey] as string | number | undefined) ?? "";
  }

  if (typeof aVal === "string" && typeof bVal === "string") {
    return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  }

  return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  }); 

  const handleSort = (key: keyof Profile | "markedCount") => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", background: "#fff", borderRadius: 12, padding: "2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <Link href="/">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
            Home
          </button>
        </Link>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-600 text-white rounded-md"
        >
          Logout
        </button>
      </div>
      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Overall Progress Report</h2>
      <p style={{ textAlign: "right", marginBottom: "2rem" }}>Total Users: {profiles.length}</p>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle} onClick={() => handleSort("name")}>Name {sortKey === "name" ? (sortAsc ? "▲" : "▼") : ""}</th>
            <th style={thStyle} onClick={() => handleSort("email")}>Email {sortKey === "email" ? (sortAsc ? "▲" : "▼") : ""}</th>
            <th style={thStyle} onClick={() => handleSort("unit")}>Unit {sortKey === "unit" ? (sortAsc ? "▲" : "▼") : ""}</th>
            <th style={thStyle} onClick={() => handleSort("markedCount")}>Total Marked Days {sortKey === "markedCount" ? (sortAsc ? "▲" : "▼") : ""}</th>
          </tr>
        </thead>
        <tbody>
          {sortedProfiles.map(profile => (
            <tr key={profile.uid}>
              <td style={tdStyle}>{profile.name}</td>
              <td style={tdStyle}>{profile.email}</td>
              <td style={tdStyle}>{profile.unit}</td>
              <td style={tdStyle}>{markedCounts[profile.uid] || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  borderBottom: "1px solid #ccc",
  padding: "0.75rem",
  cursor: "pointer",
  background: "#f7f7f7",
  textAlign: "left" as const,
};

const tdStyle = {
  borderBottom: "1px solid #eee",
  padding: "0.75rem",
  textAlign: "left" as const,
};