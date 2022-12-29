

function buscaRecarga () {
    let codigo = document.getElementById('cod_digitado').value
    let url = `http://localhost:3000/Recargas/${codigo}`

    axios.get(url)
    .then(response => {
        criaListaDinamica(response.data)
        mostraDados(response.data)       
    })
    .catch(error  =>  {
        if (error.response) {
            const msg = new Comunicado (error.response.data.codigo, 
                                        error.response.data.mensagem, 
                                        error.response.data.descricao);
            alert(msg.get());
        }    
    })

    const criaListaDinamica = ( recargas ) => {
        const ulRecargas = document.getElementById('resultados')
        recargas.map((recarga,index) => {
            const listaRecarga = document.createElement('li')
            const listaCodigo = document.createElement('h4')
            const listaCodigoRecarga = document.createElement('h1')
            const listaTipo = document.createElement('h4')
            const listaData = document.createElement('h4')
            const listaDataExpiracao = document.createElement('h4')
            const listaSituacao = document.createElement('h4')
            listaRecarga.setAttribute("id", "lista")
            listaRecarga.setAttribute("class", "card")
            listaCodigo.setAttribute("id", "codigo" + index)
            listaCodigo.innerHTML = `${recarga.codigo}`
            listaCodigoRecarga.setAttribute("id", "codigorecarga" + index)
            listaCodigoRecarga.setAttribute("class", "oculto")
            //listaCodigoRecarga.setAttribute("value", '${recarga.codigorecarga}')
            listaCodigoRecarga.innerHTML = `${recarga.codigorecarga}`
            listaTipo.setAttribute("id", "tipo" + index)
            listaTipo.innerHTML = `${recarga.tiporecarga}`
            listaData.setAttribute("id", "data")
            listaData.innerHTML = `DATA RECARGA : ${recarga.datarecarga}`
            listaDataExpiracao.setAttribute("id", "dataexpiracao")
            listaDataExpiracao.innerHTML = `DATA EXPIRAÇÃO : ${recarga.dataexpiracao}`
            listaSituacao.setAttribute("id", "situacao")
            listaSituacao.innerHTML = `SITUAÇÃO DA RECARGA : ${recarga.situacaorecarga}`
            listaRecarga.appendChild(listaCodigoRecarga)
            listaRecarga.appendChild(listaCodigo)
            listaRecarga.appendChild(listaTipo)
            listaRecarga.appendChild(listaData)
            listaRecarga.appendChild(listaDataExpiracao)
            listaRecarga.appendChild(listaSituacao)
            ulRecargas.appendChild(listaRecarga)
            const botaoUtilizacao = document.createElement('button')
            botaoUtilizacao.setAttribute("id", "botao")
            botaoUtilizacao.setAttribute("onclick", `UtilizarBilhete(${index})`)
            botaoUtilizacao.innerHTML = `Clique aqui para utilizar`
            listaRecarga.appendChild(botaoUtilizacao)
    })
}
    event.preventDefault()
}


function mostraDados () {
    document.getElementById("mensagem").className = 'oculto';
    document.getElementById("busca").className = 'oculto';
}

function Comunicado (codigo,mensagem,descricao)
{
    this.codigo    = codigo;
    this.mensagem  = mensagem;
    this.descricao = descricao;
    
    this.get = function ()
    {
        return (this.codigo   + " - " + 
                this.mensagem + " - " +
                this.descricao);

    }
}

function UtilizarBilhete (index) {
    let codigo = document.getElementById("codigo" + index)
    let tiporecarga = document.getElementById("tipo" + index)
    let codigorecarga = document.getElementById("codigorecarga" + index)

    let objUtilizacao = { codigo: codigo.textContent, codigorecarga: codigorecarga.textContent, tiporecarga: tiporecarga.textContent, datautilizacao: ''};
    let url = `http://localhost:3000/utilizacao/${codigo.textContent}/${codigorecarga.textContent}`

    axios.post(url, objUtilizacao)
    .then(response => { 
        if (response.data) {
            const msg = new Comunicado (response.data.codigo, 
                                        response.data.mensagem, 
                                        response.data.descricao);
            alert(msg.get());
        }   
    })
    .catch(error  =>  {
        if (error.response) {
            const msg = new Comunicado (error.response.data.codigo, 
                                        error.response.data.mensagem, 
                                        error.response.data.descricao);
            alert(msg.get());
        }    
    })

   event.preventDefault()
}