function cadastraRecarga() {
    let codigo = document.getElementById("cod_digitado").value
    let tipo = document.getElementById("tipo_bilhete").textContent
    let codigorecarga = document.getElementById("codigo_recarga").textContent

    let objRecarga = { codigo: parseInt(codigo), codigorecarga: parseInt(codigorecarga), tiporecarga: tipo, datarecarga: ''};
    let url = `http://localhost:3000/Recargas/`

    let res = axios.post(url, objRecarga)
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