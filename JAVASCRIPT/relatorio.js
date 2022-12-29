
function buscarBilhete() {
    let codigo = document.getElementById('cod_digitado').value
    let url = `http://localhost:3000/Bilhetes/${codigo}`
    let cont = 0;

    axios.get(url)
    .then(response => {
        while (cont == 0 )
        {
            criaTabela1(response.data);
            cont++;
        }
        criaTabela(response.data)
        criaUtilizacoes(response.data)
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

   function criaTabela1(bilhetes) {
    bilhetes.map((bilhete) => {
        if (bilhete.dataentrada == undefined)
        {
            return;
        }
        const ulTabela = document.getElementById("resultados");
        const tabelaBilhete = document.createElement('table');
        const linha1 = document.createElement('tr');
        const colunaCodigo = document.createElement('th')
        const dadoCodigo = document.createElement('td')
        const linha2 = document.createElement('tr');
        const colunaDataGeracao = document.createElement('th')
        const dadoDataGeracao = document.createElement('td')
        tabelaBilhete.setAttribute("id", "lista")
        tabelaBilhete.setAttribute("class", "card")
        colunaCodigo.setAttribute("id", "colcodigo");
        colunaCodigo.innerHTML = `Código do bilhete : `
        dadoCodigo.setAttribute("id", "codigo")
        dadoCodigo.innerHTML = `${bilhete.codigo}`
        colunaDataGeracao.setAttribute("id", "coldgeracao")
        colunaDataGeracao.innerHTML = `Geração do bilhete : `
        dadoDataGeracao.setAttribute("id", "databilhete")
        dadoDataGeracao.innerHTML = `${bilhete.dataentrada}`
        linha1.appendChild(colunaCodigo);
        linha1.appendChild(dadoCodigo);
        linha2.appendChild(colunaDataGeracao);
        linha2.appendChild(dadoDataGeracao);
        tabelaBilhete.appendChild(linha1);
        tabelaBilhete.appendChild(linha2);
        ulTabela.appendChild(tabelaBilhete);
    })
        }
    
    const criaTabela = ( bilhetes ) => {
        const ulBilhetes = document.getElementById('lista')
        bilhetes.map((recarga) => {
            if (recarga.tiporecarga ==  undefined)
            {
                return; 
            }
            if (recarga.datarecarga ==  undefined)
            {
                return; 
            }
            if (recarga.situacaorecarga ==  undefined)
            {
                return; 
            }
            const linha3 = document.createElement('tr');
            const linha4 = document.createElement('tr');
            const linha5 = document.createElement('tr');
            const colunaTipoRecarga = document.createElement('th')
            const dadoDataRecarga = document.createElement('td')
            const colunaSituacao = document.createElement('th')
            const situacaoRecarga = document.createElement('td')
            const colunaExpiracao = document.createElement('th')
            const expiracaoRecarga = document.createElement('td')
            colunaTipoRecarga.setAttribute("id", "coltrecarga")
            colunaTipoRecarga.innerHTML = `${recarga.tiporecarga}`
            dadoDataRecarga.setAttribute("id", "datarecarga")
            dadoDataRecarga.innerHTML = `${recarga.datarecarga}`
            colunaSituacao.setAttribute("id", "colsituacao")
            colunaSituacao.innerHTML = `Situação da recarga : `
            situacaoRecarga.setAttribute("id", "siturecarga")
            situacaoRecarga.innerHTML = `${recarga.situacaorecarga}`
            colunaExpiracao.setAttribute("id", "colexpiracao")
            colunaExpiracao.innerHTML = `Data de expiração : `
            expiracaoRecarga.setAttribute("id", "expiracaorecarga")
            expiracaoRecarga.innerHTML = `${recarga.dataexpiracao}`
            linha3.appendChild(colunaTipoRecarga);
            linha3.appendChild(dadoDataRecarga);
            linha5.appendChild(colunaSituacao);
            linha5.appendChild(situacaoRecarga);
            linha4.appendChild(colunaExpiracao);
            linha4.appendChild(expiracaoRecarga);
            ulBilhetes.appendChild(linha3);
            ulBilhetes.appendChild(linha5);
            ulBilhetes.appendChild(linha4);
            
    })
}

 function criaUtilizacoes ( bilhetes ) {
     bilhetes.map((utilizar, recarga) => {
        if (utilizar.datautilizacao == undefined)
        {
            return;
        }
        const ulBilhetes = document.getElementById('lista')
        const linha4 = document.createElement('tr');
        const colunaUtilizacao = document.createElement('th')
        const dadoUtilizacao = document.createElement('td')
        colunaUtilizacao.setAttribute("id", "colutilizacao")
        colunaUtilizacao.innerHTML = `UTILIZAÇÃO DO ${utilizar.tiporecarga} : `
        dadoUtilizacao.setAttribute("id", "dadoutilizacao")
        dadoUtilizacao.innerHTML = `${utilizar.datautilizacao}`
        linha4.appendChild(colunaUtilizacao);
        linha4.appendChild(dadoUtilizacao);
        ulBilhetes.appendChild(linha4)
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
