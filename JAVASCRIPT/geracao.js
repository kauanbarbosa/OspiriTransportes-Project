function cadastraBilhete() {
    let codigo = document.getElementById("cod")

    let objBilhete = { codigo: codigo.textContent, dataentrada: '', horaentrada: ''};
    let url = `http://localhost:3000/Bilhetes/`

    axios.post(url, objBilhete)
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