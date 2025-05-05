<template>
  <div class="fullscreen-form">
    <div class="form-container">
      <h1 class="form-title">Crea tu Landing Page</h1>
      <p class="form-description">
        Llena este formulario con los datos de tu empresa y nosotros nos encargaremos de crear una landing page personalizada para ti.
      </p>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="companyName">Nombre de la Empresa</label>
          <input
            type="text"
            id="companyName"
            v-model="formData.companyName"
            placeholder="Ingresa el nombre de tu empresa"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            v-model="formData.email"
            placeholder="Ingresa tu correo electrónico"
            required
          />
        </div>

        <div class="form-group">
          <label for="phone">Teléfono</label>
          <input
            type="tel"
            id="phone"
            v-model="formData.phone"
            placeholder="Ingresa tu número de teléfono"
            required
          />
        </div>

        <div class="form-group">
          <label for="description">Descripción de la Empresa</label>
          <textarea
            id="description"
            v-model="formData.description"
            placeholder="Describe brevemente tu empresa"
            rows="4"
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label for="services">Servicios o Productos</label>
          <textarea
            id="services"
            v-model="formData.services"
            placeholder="Lista los servicios o productos que ofreces"
            rows="4"
            required
          ></textarea>
        </div>

        <button type="submit" class="btn-submit">Enviar</button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  name: "LandingPageForm",
  setup() {
    const formData = ref({
      companyName: "",
      email: "",
      phone: "",
      description: "",
      services: "",
    });

    const submitForm = () => {
      console.log("Formulario enviado:", formData.value);
      alert("¡Gracias! Hemos recibido tus datos.");
      // Aquí puedes enviar los datos a un servidor o API
    };

    return {
      formData,
      submitForm,
    };
  },
};
</script>

<style scoped>
/* Fondo de pantalla completa */
.fullscreen-form {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  color: #fff;
  font-family: "Roboto", Arial, sans-serif;
  padding: 1rem;
}

/* Contenedor del formulario */
.form-container {
  background: #fff;
  color: #333;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 600px;
  animation: fadeIn 0.8s ease-in-out;
}

/* Título del formulario */
.form-title {
  text-align: center;
  margin-bottom: 1rem;
  font-size: 2.5rem; /* Aumenta el tamaño del texto */
  font-weight: bold;
  color: #333; /* Cambia el color a un tono oscuro para mejor contraste */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2); /* Agrega sombra para mayor visibilidad */
}

/* Descripción del formulario */
.form-description {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1rem;
  color: #666;
}

/* Grupo de campos */
.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #333;
}

input,
textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #6a11cb;
  box-shadow: 0 0 5px rgba(106, 17, 203, 0.5);
}

/* Botón de envío */
.btn-submit {
  display: block;
  width: 100%;
  padding: 0.8rem;
  background: #6a11cb;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-submit:hover {
  background: #4e0ba8;
}

/* Animación de entrada */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsividad */
@media (max-width: 768px) {
  .form-container {
    padding: 1.5rem;
  }

  .form-title {
    font-size: 1.5rem;
  }

  .btn-submit {
    font-size: 0.9rem;
  }
}
</style>