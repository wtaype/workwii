// src/lib/wiauth/idiomaLogin.js
// Centralización de todos los textos bilingües del módulo de autenticación

export const idiomaLogin = {
  // --- LOGIN ---
  welcome: { es: 'Bienvenido', en: 'Welcome' },
  loginSub: { es: 'Inicia sesión en tu cuenta', en: 'Log in to your account' },
  btnGoogle: { es: 'Continuar con Google', en: 'Continue with Google' },
  orEmail: { es: 'o usa tu email', en: 'or use your email' },
  inputEmail: { es: 'Email o usuario', en: 'Email or username' },
  inputPassword: { es: 'Contraseña', en: 'Password' },
  btnLogin: { es: 'Iniciar Sesión', en: 'Log In' },
  linkForgot: { es: '¿Olvidaste tu contraseña?', en: 'Forgot your password?' },
  linkRegister: { es: 'Crear cuenta', en: 'Create account' },
  msgBienvenido: { es: 'Bienvenido {name}', en: 'Welcome {name}' },

  // --- REGISTRO ---
  createAccount: { es: 'Crear Cuenta', en: 'Create Account' },
  registerSub: { es: 'Únete a la comunidad', en: 'Join the community' },
  inputRegNombre: { es: 'Nombre', en: 'First Name' },
  inputRegApellidos: { es: 'Apellidos', en: 'Last Name' },
  inputRegUsuario: { es: 'Usuario', en: 'Username' },
  inputRegEmail: { es: 'Email', en: 'Email' },
  inputRegPassword: { es: 'Contraseña', en: 'Password' },
  inputRegPasswordConfirm: { es: 'Confirmar contraseña', en: 'Confirm password' },
  checkTerminos: { es: 'Acepto los <a href="/terminos" target="_blank">términos y condiciones</a>', en: 'I accept the <a href="/terminos" target="_blank">terms and conditions</a>' },
  btnRegistrar: { es: 'Registrarme', en: 'Sign Up' },
  linkLogin: { es: 'Ya tengo cuenta', en: 'I already have an account' },

  // --- RECUPERAR ---
  recoverTitle: { es: 'Recuperar', en: 'Recover' },
  recoverSub: { es: 'Te enviaremos un enlace a tu email', en: 'We will send a link to your email' },
  btnSendLink: { es: 'Enviar enlace', en: 'Send link' },
  linkBack: { es: 'Volver', en: 'Back' },
  msgLinkEnviado: { es: 'Enlace enviado a tu email', en: 'Link sent to your email' },

  // --- COMPLETAR DATOS GOOGLE ---
  almostReady: { es: '¡Casi listo!', en: 'Almost ready!' },
  completeSub: { es: 'Completa tus datos de acceso', en: 'Complete your login info' },
  inputCompleteUser: { es: 'Ingresa un usuario (ej: marcos)', en: 'Enter a username (e.g. marcos)' },
  btnComplete: { es: 'Completar Registro', en: 'Complete Registration' },

  // --- VALIDACIONES ---
  valTerminos: { es: 'Acepta los términos', en: 'Accept the terms' },
  valUsuarioInput: { es: 'Verifica el usuario', en: 'Verify the username' },
  valEmailInput: { es: 'Verifica el email', en: 'Verify the email' },
  valUserNoAt: { es: 'No puede contener @', en: 'Cannot contain @' },
  valUserMin: { es: 'Mínimo 4 caracteres', en: 'Minimum 4 characters' },
  valNameReq: { es: 'Ingresa tu nombre', en: 'Enter your name' },
  valLastReq: { es: 'Ingresa tus apellidos', en: 'Enter your last name' },
  valPassMin: { es: 'Mínimo 6 caracteres', en: 'Minimum 6 characters' },
  valNoMatch: { es: 'No coinciden', en: 'Do not match' },
  valMatch: { es: 'Contraseñas coinciden <i class="fa-solid fa-check-circle"></i>', en: 'Passwords match <i class="fa-solid fa-check-circle"></i>' },
  
  // --- DISPONIBILIDAD ---
  userOk: { es: 'Usuario disponible <i class="fa-solid fa-check-circle"></i>', en: 'Username available <i class="fa-solid fa-check-circle"></i>' },
  userNo: { es: 'Usuario no disponible', en: 'Username not available' },
  emailOk: { es: 'Email disponible <i class="fa-solid fa-check-circle"></i>', en: 'Email available <i class="fa-solid fa-check-circle"></i>' },
  emailNo: { es: 'Email no disponible', en: 'Email not available' },
  waitAttempts: { es: 'Demasiados intentos. Espera {min} min', en: 'Too many attempts. Wait {min} min' },

  // --- ERRORES ---
  errCredentials: { es: 'Email, usuario o contraseña incorrectos', en: 'Incorrect email, username or password' },
  errRegistered: { es: 'Email ya registrado', en: 'Email already registered' },
  errWeakPassword: { es: 'Contraseña débil (mín. 6)', en: 'Weak password (min. 6)' },
  errInvalidEmail: { es: 'Email no válido', en: 'Invalid email' },
  errTooManyRequests: { es: 'Demasiados intentos. Espera unos minutos.', en: 'Too many attempts. Wait a few minutes.' },
  errGoogleSSO: { es: 'Error de sesión con Google. Intenta de nuevo.', en: 'Google session error. Try again.' },
  errProfileNotFound: { es: 'Perfil no encontrado en la base de datos.', en: 'Profile not found in database.' },
  errUserNotFound: { es: 'Usuario no encontrado', en: 'User not found' },
  errUnexpected: { es: 'Ha ocurrido un error inesperado', en: 'An unexpected error occurred' }
};

// Mapeo rápido de errores de Supabase
export const mapearErrorAuth = (e) => {
  const msg = e?.message || '';
  const map = {
    'Invalid login credentials': 'errCredentials',
    'User already registered': 'errRegistered',
    'Signup requires a valid password': 'errWeakPassword',
    'Email address is invalid': 'errInvalidEmail',
    'Too many requests': 'errTooManyRequests'
  };
  return map[msg] || 'errUnexpected';
};
