<template>
    <div class="login-container d-flex justify-content-center align-items-center min-vh-100">
      <div class="card card-login w-100" style="max-width: 600px;">
        <Logo alt="logo-uno" class="w-25 d-block mx-auto"/>
        <div class="login-card p-5 shadow-sm rounded-3 bg-white">
          <h1 class="text-center mb-4 fw-bold">Registro</h1>
          <form @submit.prevent="handleRegister">
            <div class="mb-3">
              <label class="form-label">Nombre de usuario</label>
              <input type="text" class="form-control" v-model="name" />
            </div>
            <div class="mb-3">
              <label class="form-label">Correo electrónico</label>
              <input type="email" class="form-control" v-model="email" />
            </div>
            <div class="mb-3">
              <label class="form-label">Contraseña</label>
              <input type="password" class="form-control" v-model="password" />
            </div>
            <div class="d-grid">
              <button type="submit" class="btn btn-dark">Registrarse</button>
            </div>
          </form>
          <p class="mt-3 text-center">
            ¿Ya tienes cuenta? <router-link to="/login">Iniciar sesión</router-link>
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  //import { AuthService } from '../firebase/auth.js';
  import Swal from 'sweetalert2';
  
  const name = ref('');
  const email = ref('');
  const password = ref('');
  const router = useRouter();
  
  const handleRegister = async () => {
    // Verifica que todos los campos estén completos
    if (!name.value || !email.value || !password.value) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Todos los campos son obligatorios.',
        confirmButtonText: 'OK',
      });
      return;
    }
  
    try {
      // Muestra el loading mientras se está registrando
      const loading = Swal.fire({
        title: 'Registrando...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
  
      const response = await AuthService.register({ 
        email: email.value, 
        password: password.value, 
        userData: { nombre: name.value } 
      });
  
      console.log(response);
  
      if (response.success) {
        // Si el registro es exitoso
        await Swal.fire({
          icon: "success",
          title: "Registrado",
          text: "Usuario registrado correctamente.",
          confirmButtonText: "OK",
        });
        router.push("/login");
      } else {
        // Si hubo un error en el registro
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar el usuario',
          text: response.error || "Error al registrar. Inténtalo de nuevo.",
          confirmButtonText: 'OK',
        });
      }
  
    } catch (error) {
      // Si ocurre algún error inesperado
      handleAuthError(error.code);
    } finally {
      // Cierra el loading si terminó el proceso
      Swal.close();
    }
  };
  
  // Maneja errores de autenticación
  const handleAuthError = (errorCode) => {
    let message = '';
    
    switch (errorCode) {
      case 'auth/email-already-in-use':
        message = 'El correo electrónico ya está en uso.';
        break;
      case 'auth/weak-password':
        message = 'La contraseña es demasiado débil.';
        break;
      default:
        message = 'Hubo un error al registrar. Inténtalo de nuevo.';
    }
  
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonText: 'OK',
    });
  };
  </script>