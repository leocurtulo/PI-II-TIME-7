const formulario = document.getElementById("formLogin");
const usuario = document.getElementById("usuario");
const senha = document.getElementById("senha");
const erroUsuario = document.getElementById("erroUsuario");
const erroSenha = document.getElementById("erroSenha");

// Atualiza os requisitos da senha enquanto digita
senha.addEventListener("input", function () {
    const valorSenha = senha.value;

    document.getElementById("req8").className =
        valorSenha.length >= 8 ? "valido" : "invalido";

    document.getElementById("reqMaiuscula").className =
        /[A-Z]/.test(valorSenha) ? "valido" : "invalido";

    document.getElementById("reqMinuscula").className =
        /[a-z]/.test(valorSenha) ? "valido" : "invalido";

    document.getElementById("reqNumero").className =
        /[0-9]/.test(valorSenha) ? "valido" : "invalido";

    document.getElementById("reqEspecial").className =
        /[!@#$%^&*(),.?":{}|<>]/.test(valorSenha)
            ? "valido"
            : "invalido";
});

formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    erroUsuario.textContent = "";
    erroSenha.textContent = "";

    usuario.classList.remove("campo-invalido");
    senha.classList.remove("campo-invalido");

    let formularioValido = true;

    const email = usuario.value.trim();

    if (email === "") {
        erroUsuario.textContent = "O e-mail é obrigatório.";
        usuario.classList.add("campo-invalido");
        formularioValido = false;
    } else if (!email.includes("@") || !email.includes(".")) {
        erroUsuario.textContent = "Digite um e-mail válido.";
        usuario.classList.add("campo-invalido");
        formularioValido = false;
    }

    const valorSenha = senha.value;

    if (
        valorSenha.length < 8 ||
        !/[A-Z]/.test(valorSenha) ||
        !/[a-z]/.test(valorSenha) ||
        !/[0-9]/.test(valorSenha) ||
        !/[!@#$%^&*(),.?":{}|<>]/.test(valorSenha)
    ) {
        erroSenha.textContent = "A senha não atende todos os requisitos.";
        senha.classList.add("campo-invalido");
        formularioValido = false;
    }

    if (formularioValido) {
        alert("Login validado com sucesso!");
    }
});