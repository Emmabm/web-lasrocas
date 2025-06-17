import { useState } from "react";
import { Guest } from "../types/guest";

const Guests = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [activeTab, setActiveTab] = useState<"all" | "male" | "female">("all");

  const addGuest = () => {
    if (!firstName.trim() || !lastName.trim() || !dni.trim()) return;

    const newGuest: Guest = {
      id: crypto.randomUUID(),
      firstName,
      lastName,
      dni,
      gender,
    };

    // Agregar nuevo invitado y ordenar por apellido
    const updatedGuests = [...guests, newGuest].sort((a, b) =>
      a.lastName.localeCompare(b.lastName)
    );

    setGuests(updatedGuests);
    setFirstName("");
    setLastName("");
    setDni("");
  };

  const deleteGuest = (id: string) => {
    setGuests(guests.filter(guest => guest.id !== id));
  };

  // Filtrar invitados según la pestaña activa
  const filteredGuests = guests.filter(guest => {
    if (activeTab === "all") return true;
    return guest.gender === activeTab;
  });

  return (
    <div className="p-6 text-white min-h-screen bg-gradient-to-b from-orange-400 to-white">
      <h1 className="text-2xl font-bold mb-4">Lista de Invitados</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
        <input
          type="text"
          className="p-2 rounded bg-gray-700 text-white"
          placeholder="Apellido"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          type="text"
          className="p-2 rounded bg-gray-700 text-white"
          placeholder="Nombre"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          className="p-2 rounded bg-gray-700 text-white"
          placeholder="DNI"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
        />
        <select
          className="p-2 rounded bg-gray-700 text-white"
          value={gender}
          onChange={(e) => setGender(e.target.value as "male" | "female")}
        >
          <option value="male">Hombre</option>
          <option value="female">Mujer</option>
        </select>
        <button
          className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded"
          onClick={addGuest}
        >
          Agregar
        </button>
      </div>

      {/* Pestañas para filtrar */}
      <div className="flex mb-4 border-b border-orange-300">
        <button
          className={`px-4 py-2 ${activeTab === "all" ? "bg-orange-600" : "bg-orange-400"} rounded-t mr-1`}
          onClick={() => setActiveTab("all")}
        >
          Todos
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "male" ? "bg-orange-600" : "bg-orange-400"} rounded-t mr-1`}
          onClick={() => setActiveTab("male")}
        >
          Hombres
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "female" ? "bg-orange-600" : "bg-orange-400"} rounded-t`}
          onClick={() => setActiveTab("female")}
        >
          Mujeres
        </button>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-orange-600">
            <th className="p-2">Apellido</th>
            <th className="p-2">Nombre</th>
            <th className="p-2">DNI</th>
            <th className="p-2">Género</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredGuests.map((g) => (
            <tr key={g.id} className="border-t border-orange-300">
              <td className="p-2 text-gray-900">{g.lastName}</td>
              <td className="p-2 text-gray-900">{g.firstName}</td>
              <td className="p-2 text-gray-900">{g.dni}</td>
              <td className="p-2 text-gray-900">
                {g.gender === "male" ? "Hombre" : "Mujer"}
              </td>
              <td className="p-2">
                <button
                  className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded"
                  onClick={() => deleteGuest(g.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Guests;