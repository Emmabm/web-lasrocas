import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const ThankYou = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-start justify-center p-4 sm:p-8 mt-8">
      <motion.div
      
        className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center transform transition-all"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        </motion.div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
          ¡Todo listo!
        </h2>
        <p className="text-gray-600 text-lg mb-6">
          Hemos recibido y guardado todos los datos de tu evento correctamente. Te contactaremos pronto para confirmar los detalles.
        </p>
        <motion.button
          className="bg-[#FF6B35] text-white px-8 py-3 rounded-full text-base font-semibold hover:bg-[#FF6B35]/90 transition-colors duration-300 shadow-md"
          onClick={() => navigate(`/cliente?token=${token}`)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Volver al Inicio
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ThankYou;