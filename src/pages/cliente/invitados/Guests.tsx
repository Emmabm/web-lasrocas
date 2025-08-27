import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import { useNavigate } from "react-router-dom";

interface Guest {
  id: string;
  first_name: string;
  last_name: string;
  dni: string;
  gender: "male" | "female";
  evento_id: string;
}

interface GuestsProps {
  eventId: string;
  token: string;
}

const Guests = ({ eventId, token }: GuestsProps) => {
  const navigate = useNavigate();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [activeTab, setActiveTab] = useState<"all" | "male" | "female">("all");
  const [editId, setEditId] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuests = async () => {
      const { data, error } = await supabase
        .from("invitados")
        .select("*")
        .eq("evento_id", eventId);

      if (error) {
        console.error("Error al cargar invitados:", error.message);
        setModalMessage(`Error al cargar invitados: ${error.message}`);
        return;
      }
      if (data) {
        const sorted = data.sort((a, b) => a.last_name.localeCompare(b.last_name));
        setGuests(sorted);
      }
    };

    fetchGuests();
  }, [eventId]);

  const addGuest = () => {
    if (!firstName.trim() || !lastName.trim() || !dni.trim()) {
      setModalMessage("Por favor, completa todos los campos");
      return;
    }

    if (guests.some((g) => g.dni === dni && g.id !== editId)) {
      setModalMessage("El DNI ya está registrado para este evento");
      return;
    }

    const newGender = activeTab === "male" ? "male" : activeTab === "female" ? "female" : gender;

    const newGuest = {
      id: editId || crypto.randomUUID(),
      first_name: firstName,
      last_name: lastName,
      dni,
      gender: newGender,
      evento_id: eventId,
    };

    if (editId) {
      setGuests((prev) =>
        prev
          .map((g) => (g.id === editId ? newGuest : g))
          .sort((a, b) => a.last_name.localeCompare(b.last_name))
      );
      setEditId(null);
    } else {
      setGuests((prev) =>
        [...prev, newGuest].sort((a, b) => a.last_name.localeCompare(b.last_name))
      );
    }

    setFirstName("");
    setLastName("");
    setDni("");
    setGender("male");
    setMenuOpenId(null);
  };

  const deleteGuest = (id: string) => {
    setGuests(guests.filter((g) => g.id !== id));
    setEditId(null);
    setFirstName("");
    setLastName("");
    setDni("");
    setGender("male");
    setMenuOpenId(null);
  };

  const startEdit = (guest: Guest) => {
    setEditId(guest.id);
    setFirstName(guest.first_name);
    setLastName(guest.last_name);
    setDni(guest.dni);
    setGender(guest.gender);
    setMenuOpenId(null);
  };

  const cancelEdit = () => {
    setEditId(null);
    setFirstName("");
    setLastName("");
    setDni("");
    setGender("male");
    setMenuOpenId(null);
  };

  const handleFinalize = async () => {
    if (guests.length === 0) {
      setModalMessage("Debes agregar al menos un invitado antes de finalizar");
      return;
    }

    const { error: deleteError } = await supabase
      .from("invitados")
      .delete()
      .eq("evento_id", eventId);

    if (deleteError) {
      console.error("Error al limpiar invitados previos:", deleteError.message);
      setModalMessage(`Error al limpiar invitados previos: ${deleteError.message}`);
      return;
    }

    const { error } = await supabase.from("invitados").insert(
      guests.map((guest) => ({
        id: guest.id,
        first_name: guest.first_name,
        last_name: guest.last_name,
        dni: guest.dni,
        gender: guest.gender,
        evento_id: eventId,
      }))
    );

    if (error) {
      console.error("Error al guardar invitados:", error.message);
      setModalMessage(`Error al guardar invitados: ${error.message}`);
      return;
    }

    console.log("Invitados guardados correctamente");
    navigate(`/thank-you?token=${token}`);
  };

  const renderList = (filteredGuests: Guest[], label?: string) => (
    <div>
      {label && <h3 className="text-xl font-semibold text-gray-700 mb-4">{label}</h3>}
      <ul className="space-y-2">
        {filteredGuests.map((guest) => (
          <li
            key={guest.id}
            className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm hover:bg-orange-100 transition-colors text-base"
          >
            {editId === guest.id ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full flex-wrap">
                <input
                  className="border border-gray-300 px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35] text-base min-w-[120px]"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Apellido"
                />
                <input
                  className="border border-gray-300 px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35] text-base min-w-[120px]"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Nombre"
                />
                <input
                  className="border border-gray-300 px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35] text-base min-w-[120px]"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="DNI"
                />
                {activeTab === "all" && (
                  <select
                    className="border border-gray-300 px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35] text-base min-w-[120px]"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as "male" | "female")}
                  >
                    <option value="male">Hombre</option>
                    <option value="female">Mujer</option>
                  </select>
                )}
                <div className="flex gap-2 sm:mt-0 mt-2">
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-base"
                    onClick={addGuest}
                  >
                    Guardar
                  </button>
                  <button
                    className="bg-gray-400 text-white px-3 py-1 rounded-md hover:bg-gray-500 text-base"
                    onClick={cancelEdit}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between w-full items-center">
                <span className="text-gray-800">
                  {guest.last_name} {guest.first_name} DNI: {guest.dni}
                </span>
                <div className="relative">
                  <button
                    className="text-gray-800 hover:text-gray-900 text-lg font-bold"
                    onClick={() => setMenuOpenId(menuOpenId === guest.id ? null : guest.id)}
                  >
                    ⋮
                  </button>
                  {menuOpenId === guest.id && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => startEdit(guest)}
                      >
                        Editar
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        onClick={() => deleteGuest(guest.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </li>
        ))}
        {filteredGuests.length === 0 && (
          <li className="text-gray-500 text-base p-3">No hay invitados en esta categoría.</li>
        )}
      </ul>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8">
      {modalMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Atención</h3>
            <p className="text-gray-600 mb-6">{modalMessage}</p>
            <button
              className="bg-[#FF6B35] text-white px-4 py-2 rounded-md hover:bg-[#FF6B35]/90 w-full transition-colors"
              onClick={() => setModalMessage(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="mr-3">📋</span> Lista de Invitados
        </h2>

        <div className="flex gap-4 mb-6">
          {["all", "male", "female"].map((tab) => (
            <button
              key={tab}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab
                  ? "bg-[#FF6B35] text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTab(tab as typeof activeTab)}
            >
              {tab === "all" ? "Todos" : tab === "male" ? "Hombres" : "Mujeres"} (
              {guests.filter((g) => tab === "all" || g.gender === tab).length})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-8">
          <input
            type="text"
            className="border border-gray-300 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all text-base"
            placeholder="Apellido"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <input
            type="text"
            className="border border-gray-300 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all text-base"
            placeholder="Nombre"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            className="border border-gray-300 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all text-base"
            placeholder="DNI"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
          />
          {activeTab === "all" && (
            <select
              className="border border-gray-300 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all text-base"
              value={gender}
              onChange={(e) => setGender(e.target.value as "male" | "female")}
            >
              <option value="male">Hombre</option>
              <option value="female">Mujer</option>
            </select>
          )}
          <button
            className="bg-[#FF6B35] text-white px-4 py-3 rounded-md hover:bg-[#FF6B35]/90 transition-colors text-base"
            onClick={addGuest}
          >
            {editId ? "Guardar cambios" : "Agregar"}
          </button>
        </div>

        {activeTab === "all" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderList(guests.filter((g) => g.gender === "male"), "Hombres")}
            {renderList(guests.filter((g) => g.gender === "female"), "Mujeres")}
          </div>
        ) : (
          renderList(guests.filter((g) => g.gender === activeTab))
        )}

        <div className="mt-8">
          <button
            className="bg-[#FF6B35] text-white px-6 py-3 rounded-md hover:bg-[#FF6B35]/90 w-full text-base font-semibold transition-colors"
            onClick={handleFinalize}
          >
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Guests;
