const formulario = document.getElementById("formLogin");
const usuario = document.getElementById("usuario");
const senha = document.getElementById("senha");
const erroUsuario = document.getElementById("erroUsuario");
const erroSenha = document.getElementById("erroSenha");

formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    erroUsuario.textContent = "";
    erroSenha.textContent = "";

    usuario.classList.remove("campo-invalido");
    senha.classList.remove("campo-invalido");

    let formularioValido = true;

    if (usuario.value.trim() === "") {
        erroUsuario.textContent = "O campo usuário é obrigatório.";
        usuario.classList.add("campo-invalido");
        formularioValido = false;
    } else if (usuario.value.trim().length < 3) {
        erroUsuario.textContent = "O usuário deve possuir pelo menos 3 caracteres.";
        usuario.classList.add("campo-invalido");
        formularioValido = false;
    }

    const valorSenha = senha.value;

    if (valorSenha === "") {
        erroSenha.textContent = "O campo senha é obrigatório.";
        senha.classList.add("campo-invalido");
        formularioValido = false;
    } else if (valorSenha.length < 8) {
        erroSenha.textContent = "A senha deve possuir pelo menos 8 caracteres.";
        senha.classList.add("campo-invalido");
        formularioValido = false;
    } else if (!/[A-Z]/.test(valorSenha)) {
        erroSenha.textContent = "A senha deve possuir pelo menos uma letra maiúscula.";
        senha.classList.add("campo-invalido");
        formularioValido = false;
    } else if (!/[a-z]/.test(valorSenha)) {
        erroSenha.textContent = "A senha deve possuir pelo menos uma letra minúscula.";
        senha.classList.add("campo-invalido");
        formularioValido = false;
    } else if (!/[0-9]/.test(valorSenha)) {
        erroSenha.textContent = "A senha deve possuir pelo menos um número.";
        senha.classList.add("campo-invalido");
        formularioValido = false;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(valorSenha)) {
        erroSenha.textContent = "A senha deve possuir pelo menos um caractere especial.";
        senha.classList.add("campo-invalido");
        formularioValido = false;
    }

    if (formularioValido) {
        alert("Login validado com sucesso!");
    }
});