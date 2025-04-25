import { createSubCollection } from "./servicesFirebase";

/**
 * Inicializar las cartas (políticas) en la base de datos para una partida.
 * @param {string} idPartida - ID de la partida.
 */
export const initializePolicies = async (idPartida) => {
  try {
    // Crear 6 cartas liberales y 11 cartas fascistas
    const politicas = [
      ...Array(6).fill({ tipo_carta: "liberal", estado: "mazo" }),
      ...Array(11).fill({ tipo_carta: "fascista", estado: "mazo" }),
    ];

    // Mezclar las cartas
    const shuffledPolicies = politicas.sort(() => Math.random() - 0.5);

    // Guardar las cartas en la subcolección "politicas"
    for (let i = 0; i < shuffledPolicies.length; i++) {
      const politicaData = {
        ...shuffledPolicies[i],
        orden: i + 1, // Orden en el mazo
        id_partida: idPartida,
        id_turno: null, // Se asignará cuando se juegue
      };
      await createSubCollection("partidas", idPartida, "politicas", politicaData);
    }

    console.log("Cartas inicializadas con éxito.");
  } catch (error) {
    console.error("Error al inicializar las cartas:", error);
    throw error;
  }
};