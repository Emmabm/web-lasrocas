import { useState } from "react";
import { Guest } from "../types/guest";

const Guests = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");

  const addGuest = () => {
    if (!firstName.trim() || !lastName.trim() || !dni.trim()) return;

    const newGuest: Guest = {
      id: crypto.randomUUID(),
      firstName,
      lastName,
      dni,
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

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Lista de Invitados</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
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
        <button
          className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded"
          onClick={addGuest}
        >
          Agregar
        </button>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-orange-600">
            <th className="p-2">Apellido</th>
            <th className="p-2">Nombre</th>
            <th className="p-2">DNI</th>
          </tr>
        </thead>
        <tbody>
          {guests.map((g) => (
            <tr key={g.id} className="border-t border-orange-300">
              <td className="p-2 text-gray-900">{g.lastName}</td>
              <td className="p-2 text-gray-900">{g.firstName}</td>
              <td className="p-2 text-gray-900">{g.dni}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Guests;
