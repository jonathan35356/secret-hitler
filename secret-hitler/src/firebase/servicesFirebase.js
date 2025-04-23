import { db } from "./config.js";
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  collectionGroup,
  writeBatch,
} from "firebase/firestore";

// Funciones CRUD para Firestore

export const emptyCollection = async (nombreColeccion) => {
  try {
    // Obtén una referencia a la colección
    const coleccionRef = collection(db, nombreColeccion);

    // Agrega un documento temporal
    const docRef = await addDoc(coleccionRef, {
      temporal: true,
    });

    console.log("Documento temporal agregado con ID: ", docRef.id);

    // Elimina el documento temporal inmediatamente
    await deleteDoc(doc(db, nombreColeccion, docRef.id));

    console.log("Documento temporal eliminado");
  } catch (e) {
    console.error("Error al crear la colección: ", e);
  }
};

export const createDocument = async (nombreColeccion, dataDocument, idEspecifico = null) => {
  try {
    // Obtén una referencia a la colección
    const coleccionRef = collection(db, nombreColeccion);
    let docRef;
    // Si se proporciona un ID específico, usa ese ID
    if (idEspecifico) {
      docRef = doc(coleccionRef, idEspecifico);
      await setDoc(docRef, dataDocument);
    } else {
      
      docRef = await addDoc(coleccionRef, dataDocument);
    }
    console.log("Documento creado con ID: ", docRef.id);
  } catch (e) {
    console.error("Error al crear el documento: ", e);
    throw e;
  }
};

export const readCollection = async (nombreColeccion) => {
  try {
    // Obtén una referencia a la colección
    const coleccionRef = collection(db, nombreColeccion);

    // Obtén todos los documentos de la colección
    const querySnapshot = await getDocs(coleccionRef);

    // Mapea los documentos a un array de objetos
    // Necesario para poder usarlo en el template
    const documentos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return documentos;
  } catch (e) {
    console.error("Error al leer los documentos: ", e);
  }
};

export const readSubcollection = async (nombreColeccion, idDocumentoPrincipal, nombreSubcoleccion) => {
  try {
    // Obtén una referencia a la subcolección
    const subcoleccionRef = collection(db, nombreColeccion, idDocumentoPrincipal, nombreSubcoleccion);

    // Obtén todos los documentos de la subcolección
    const querySnapshot = await getDocs(subcoleccionRef);

    const documentos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return documentos;
  } catch (e) {
    console.error("Error al leer la subcolección: ", e);
    throw e;
  }
};


export const readDocumentById = async (nombreColeccion, id) => {
  try {
    // Obtén una referencia al documento
    const docRef = doc(db, nombreColeccion, id);

    // Obtén el documento
    const docSnap = await getDoc(docRef);

    // Verifica si el documento existe y lo formatea
    if (docSnap.exists()) {
      // console.log("Documento encontrado: ", docSnap.data());
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log("No se encontró el documento con ID: ", id);
      return null;
    }
  } catch (e) {
    console.error("Error al leer el documento: ", e);
    throw e;
  }
};

export const queryDocuments = async (nombreColeccion, campo, valor) => {
  try {
    // Obtén una referencia a la colección
    const coleccionRef = collection(db, nombreColeccion);

    // Filtra los documentos por el campo y valor especificados
    const consulta = query(coleccionRef, where(campo, "==", valor));

    // Obtén los documentos filtrados
    const querySnapshot = await getDocs(consulta);

    // Mapea los documentos a un array de objetos
    const documentos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return documentos;
  } catch (e) {
    console.error("Error al consultar los documentos: ", e);
  }
}

export const querySingleDocument = async (nombreColeccion, campo, valor) => {
  try {
    // Obtén una referencia a la colección
    const coleccionRef = collection(db, nombreColeccion);

    // Filtra los documentos por el campo y valor especificados
    const consulta = query(coleccionRef, where(campo, "==", valor));

    // Obtén los documentos filtrados
    const querySnapshot = await getDocs(consulta);

    // Verifica si se encontró un solo documento
    if (!querySnapshot.empty && querySnapshot.size === 1) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } else {
      console.log("No se encontró el documento o hay más de uno con ese valor.");
      return null;
    }
  } catch (e) {
    console.error("Error al consultar el documento: ", e);
  }
}

export const updateDocument = async (nombreColeccion, id, dataDocument) => {
  try {
    // Obtén una referencia al documento
    const docRef = doc(db, nombreColeccion, id);

    // Actualiza el documento
    await updateDoc(docRef, dataDocument);

    console.log("Documento actualizado con ID: ", id);
  } catch (e) {
    console.error("Error al actualizar el documento: ", e);
  }
};

export const updateSubcollectionDocument = async (nombreColeccion, idDocumentoPrincipal, nombreSubcoleccion, idSubdocumento, dataDocument) => {
  try {
    // Referencia al documento dentro de la subcolección
    const docRef = doc(db, nombreColeccion, idDocumentoPrincipal, nombreSubcoleccion, idSubdocumento);

    // Actualizar los campos en el documento
    await updateDoc(docRef, dataDocument);

    console.log(`Documento actualizado en la subcolección "${nombreSubcoleccion}" con ID: ${idSubdocumento}`);
  } catch (e) {
    console.error("Error al actualizar el documento en la subcolección:", e);
    throw e;
  }
};

export const deleteDocument = async (nombreColeccion, id) => {
  try {
    // Obtén una referencia al documento
    const docRef = doc(db, nombreColeccion, id);

    // Elimina el documento
    await deleteDoc(docRef);

    console.log("Documento eliminado con ID: ", id);
  } catch (e) {
    console.error("Error al eliminar el documento: ", e);
  }
};

export const deleteCollection = async (nombreColeccion) => {
  try {
    // Obtén una referencia a la colección
    const coleccionRef = collection(db, nombreColeccion);

    // Obtén todos los documentos de la colección
    const querySnapshot = await getDocs(coleccionRef);

    // Elimina cada documento
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
      console.log("Documento eliminado con ID: ", doc.id);
    });
  } catch (e) {
    console.error("Error al eliminar la colección: ", e);
  }
};

export const createSubCollection = async (
  nombreColeccion,
  id,
  nombreSubColeccion,
  dataDocument,
  idEspecifico = null
) => {
  try {
    // Obtén una referencia al documento padre
    const docRef = doc(db, nombreColeccion, id);

    // Obtén una referencia a la subcolección
    const subColeccionRef = collection(docRef, nombreSubColeccion);
    let docSubRef;
    // Si se proporciona un ID específico, usa ese ID
    if (idEspecifico) {
      docSubRef = doc(subColeccionRef, idEspecifico);
      await setDoc(docSubRef, dataDocument);
    } else {
      
      docSubRef = await addDoc(subColeccionRef, dataDocument);
    }
    console.log("Documento agregado a la subcolección con ID: ", docSubRef.id);
  } catch (e) {
    console.error("Error al crear el documento en la subcolección: ", e);
  }
};

//Mantener actualizacion en tiempo real de una coleccion
export const onSnapshotCollection = (nombreColeccion, callback) => {
  try {
    // Obtén una referencia a la colección
    const coleccionRef = collection(db, nombreColeccion);

    // Escucha los cambios en tiempo real
    const unsubscribe = onSnapshot(coleccionRef, (snapshot) => {
      const documentos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(documentos);
    });

    return unsubscribe; // Devuelve la función de cancelación
  } catch (e) {
    console.error("Error al escuchar la colección: ", e);
  }
};

export const onSnapshotSubcollection = (nombreColeccion, idDocumentoPrincipal, nombreSubcoleccion, callback) => {
  try {
    // Obtén una referencia a la subcolección
    const subcoleccionRef = collection(db, nombreColeccion, idDocumentoPrincipal, nombreSubcoleccion);

    // Escucha los cambios en tiempo real en la subcolección
    const unsubscribe = onSnapshot(subcoleccionRef, (snapshot) => {
      const documentos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(documentos);
    });

    return unsubscribe; // Devuelve la función para cancelar la suscripción
  } catch (e) {
    console.error("Error al escuchar la subcolección: ", e);
  }
};

//Mantener actualizacion en tiempo real de un documento
export const onSnapshotDocument = (nombreColeccion, id, callback) => {
  try {
    // Obtén una referencia al documento
    const docRef = doc(db, nombreColeccion, id);

    // Escucha los cambios en tiempo real
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        console.log("No se encontró el documento con ID: ", id);
      }
    });

    return unsubscribe; // Devuelve la función de cancelación
  } catch (e) {
    console.error("Error al escuchar el documento: ", e);
  }
};

export const onSnapshotSubcollectionWithFullData = (
  nombreColeccion,
  idDocumentoPrincipal,
  nombreSubcoleccion,
  callback
) => {
  try {
    // Obtén una referencia a la subcolección
    const subcoleccionRef = collection(
      db,
      nombreColeccion,
      idDocumentoPrincipal,
      nombreSubcoleccion
    );

    // Escucha los cambios en tiempo real en la subcolección
    const unsubscribe = onSnapshot(subcoleccionRef, async (snapshot) => {
      // Mapea la información de jugadores_partida
      const datosSubcoleccion = snapshot.docs.map((doc) => ({
        idJugadorPartida: doc.id, // ID del jugador
        ...doc.data(), // Otros campos de jugadores_partida
      }));

      // Consulta los nombres correspondientes desde la colección "jugadores"
      for (const jugador of datosSubcoleccion) {
        const jugadorDocRef = doc(db, "jugadores", jugador.idJugador);
        const jugadorDoc = await getDoc(jugadorDocRef);

        if (jugadorDoc.exists()) {
          jugador.nombre = jugadorDoc.data().nombre; // Añade el nombre al jugador
        } else {
          jugador.nombre = "Desconocido"; // Si no se encuentra, asigna un valor por defecto
        }
      }

      // Ejecuta el callback con los datos completos
      callback(datosSubcoleccion);
    });

    return unsubscribe; // Devuelve la función para cancelar la suscripción
  } catch (e) {
    console.error("Error al escuchar la subcolección con nombres:", e);
  }
};


export const listenToSubcollectionFiltered = (subcollection, callback, field = "place", value = "mano") => {
  const subcollectionQuery = query(
    collectionGroup(db, subcollection), // Subcolección parametrizada
    where(field, "==", value) // Filtrar por campo y valor personalizados
  );

  const unsubscribe = onSnapshot(subcollectionQuery, (querySnapshot) => {
    const data = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });

    console.log(`Datos filtrados de '${subcollection}' por ${field}='${value}':`, data);
    callback(data); // Llama al callback con los datos filtrados
  });

  return unsubscribe; // Retorna una función para detener la escucha
};


export const listenToMultipleSubcollections = (subcollections, callback, field , value) => {
  const unsubscribes = [];

  subcollections.forEach((subcollection) => {
    const subcollectionQuery = query(
      collectionGroup(db, subcollection), // Subcolección dinámica
      where(field, "==", value) // Filtrar por campo y valor
    );

    const unsubscribe = onSnapshot(subcollectionQuery, (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data(), subcollection }); // Agregar el nombre de la subcolección
      });

      console.log(`Datos filtrados de '${subcollection}' por ${field}='${value}':`, data);
      callback(data, subcollection); // Devolver datos y subcolección al callback
    });

    unsubscribes.push(unsubscribe);
  });

  // Retornar función para detener todas las suscripciones
  return () => {
    unsubscribes.forEach((unsubscribe) => unsubscribe());
  };
};

export const enrichDataWithField = async (data, targetCollection, fieldToMatch, fieldToRetrieve) => {
  // Mapea los datos y enriquece cada entrada con información de la colección objetivo
  console.log("datos enrich",data)
  const enrichedData = await Promise.all(
    data.map(async (item) => {
      const docRef = doc(db, targetCollection, item[fieldToMatch]); // Documento en la colección objetivo
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          ...item, // Mantén los datos originales
          [fieldToRetrieve]: docSnap.data()[fieldToRetrieve], // Añade el campo solicitado
        };
      } else {
        return {
          ...item,
          [fieldToRetrieve]: "Desconocido", // Valor por defecto si no se encuentra el documento
        };
      }
    })
  );

  return enrichedData; // Devuelve los datos enriquecidos
};

export const deleteQuerySubcolletionBatch = async (nombreColeccion, idDocumento, subcoleccion, campo, valor) => {
  try {
    const subcoleccionRef = collection(db, nombreColeccion, idDocumento, subcoleccion);
    const consulta = query(subcoleccionRef, where(campo, "==", valor));

    // Obtener documentos que cumplen el criterio
    const snapshot = await getDocs(consulta);

    if (!snapshot.empty) {
      // Crear una instancia de WriteBatch
      const batch = writeBatch(db);

      // Agregar cada documento al batch para ser eliminado
      snapshot.docs.forEach((docSnap) => {
        const docRef = doc(db, nombreColeccion, idDocumento, subcoleccion, docSnap.id);
        batch.delete(docRef);
      });

      // Confirmar todas las operaciones en el batch
      await batch.commit();
      console.log(`Se eliminaron ${snapshot.size} documentos en la subcolección "${subcoleccion}" con el criterio: ${campo} = ${valor}.`);
    } else {
      console.log(`No se encontraron documentos en la subcolección "${subcoleccion}" con el criterio: ${campo} = ${valor}.`);
    }
  } catch (error) {
    console.error("Error al eliminar en la subcolección con WriteBatch:", error);
  }
};
