const { get } = require('http');
const oracledb = require('oracledb')

function BD () // IN THIS PART, WE HAVE A DATABASE CONFIGURATION, LIKE CONNECTION, CREATE TABLES, ETC.
{	
    process.env.ORA_SDTZ = 'UTC-3'; // garante horário de Brasília
	this.getConexao = async function ()
	{
        try {
            const conexao = await oracledb.getConnection({ user: "SYSTEM", password: "ospiri", connectionString: "localhost/xe" }); // CHANGE THIS INFORMATIONS IF YOU WILL THIS PROGRAM 
            global.conexao = conexao;
            return conexao;
        }
		catch (erro)
		{
			console.log ('Não foi possível estabelecer conexão com o BD!');
			process.exit(1);
		}
		return global.conexao;
	}

	this.estrutureSe = async function ()
	{
        const conexao = await this.getConexao();

        if (conexao==undefined) return null;
        const sql = `create table bilhetes (
            cod_bilhete number(20),
            data_geracao date,
            hora_geracao timestamp,
            primary key (cod_bilhete))`;
        try {
            await conexao.execute(sql);
            return true;
        }catch(erro){
            console.log(erro)
            return false;
        }
	}

    this.estrutureSe2 = async function ()
	{
        const conexao = await this.getConexao();

        if (conexao==undefined) return null;
        const sql = `create table recargas (
            cod_bilhete number(20),
            cod_recarga number(20),
            tipo_recarga varchar2(30),
            data_recarga timestamp,
            situacao_recarga varchar(20),
            data_ativacao timestamp,
            data_expiracao timestamp)`;
        try {
            await conexao.execute(sql);
            return true;
        }catch(erro){
            console.log(erro)
            return false;
        }
	}

    this.estrutureSe3 = async function () 
    {
        const conexao = await this.getConexao();

        if (conexao == undefined) return null; 
        const sql = `create table utilizacoes ( 
            cod_bilhete number(20)not null,
            cod_recarga number(20),
            tipo_recarga varchar2(30),
            data_utilizacao timestamp)`;
        try {
            await conexao.execute(sql);
            return true;
        }catch(erro){
            console.log(erro)
            return false; 
        }
    }
}

function Bilhetes (bd) // HERE, WE HAVE THE FUNCTION OF BILHETES
{
	this.bd = bd;
	
	this.inclua = async function (bilhete)
	{
		const conexao = await this.bd.getConexao();
		
		const sql1 = "INSERT INTO BILHETES (COD_BILHETE, DATA_GERACAO, HORA_GERACAO)" + "VALUES (:0, sysdate, SYSTIMESTAMP)";
		const dados = [bilhete.codigo];
		console.log(sql1, dados);
		await conexao.execute(sql1,dados);
		
		const sql2 = 'COMMIT';
		await conexao.execute(sql2);	
	}
    this.relatorio = async function (codigo)
    {
        const conexao = await this.bd.getConexao();

        const sql1 = "SELECT COD_BILHETE, TO_CHAR(HORA_GERACAO, 'DD-MM-YYYY HH24:MI:SS') FROM BILHETES WHERE COD_BILHETE = :0";
        const dados = [codigo];
        console.log(sql1, dados);
        rec = await conexao.execute(sql1, dados);

        return rec.rows;
    }
}

function Recargas (bd) // HERE, WE HAVE THE FUNCTION OF RECARGAS
{
    process.env.ORA_SDTZ = 'UTC-3'; // BRASÍLIA HOUR
	this.bd = bd;

    this.buscarBilhete = async function (recarga)
    {
        const conexao = await this.bd.getConexao();

        const sql1 = "SELECT COD_BILHETE FROM BILHETES WHERE COD_BILHETE= :0"
        const dados = [recarga.codigo];
        console.log(sql1, dados)
        ret = await conexao.execute(sql1, dados);

        return ret.rows;
    }
    this.recarga = async function (recarga)
	{
		const conexao = await this.bd.getConexao();
		
		const sql1 = "INSERT INTO RECARGAS (COD_BILHETE, COD_RECARGA, TIPO_RECARGA, DATA_RECARGA, SITUACAO_RECARGA)" + "VALUES (:0, :1, :2, SYSTIMESTAMP, 'VÁLIDA')";
		const dados = [recarga.codigo, recarga.codigorecarga, recarga.tiporecarga];
		console.log(sql1, dados);
		await conexao.execute(sql1,dados);
		
		const sql2 = 'COMMIT';
		await conexao.execute(sql2);	
	}

	this.recupereUm = async function (codigo)
	{
		const conexao = await this.bd.getConexao();
		
		const sql = "SELECT COD_BILHETE,COD_RECARGA,TIPO_RECARGA,SITUACAO_RECARGA, TO_CHAR(DATA_RECARGA, 'DD-MM-YYYY HH24:MI:SS'), TO_CHAR(DATA_ATIVACAO, 'DD-MM-YYYY HH24:MI:SS'), TO_CHAR(DATA_EXPIRACAO, 'DD-MM-YYYY HH24:MI:SS') " +
		            "FROM RECARGAS WHERE COD_BILHETE=:0";
		const dados = [codigo];
        console.log(sql, dados)


		ret =  await conexao.execute(sql,dados);
        console.log(ret)
		
		return ret.rows;
	}

    this.recupereRecarga = async function (codigo, codigorecarga)
	{
		const conexao = await this.bd.getConexao();
		
		const sql = "SELECT SITUACAO_RECARGA, TIPO_RECARGA, TO_CHAR(DATA_ATIVACAO, 'DD-MM-YYYY HH24:MI:SS'), TO_CHAR(DATA_EXPIRACAO, 'DD-MM-YYYY HH24:MI:SS') " +
		            "FROM RECARGAS WHERE COD_BILHETE=:0 AND COD_RECARGA=:1";
		const dados = [codigo, codigorecarga];
        console.log(sql, dados)

		ret =  await conexao.execute(sql,dados);
		
		return ret.rows;
	}

    this.atualizar = async function (codigo, codigorecarga, tipo, situacao)
	{
		const conexao = await this.bd.getConexao();
		
        const data = new Date();
        console.log(tipo);

        if (tipo == 'BILHETE ÚNICO')
        {
            const dataexpiracao = new Date()
            dataexpiracao.setMinutes(dataexpiracao.getMinutes() + 40)

            try{
                const sql = "UPDATE RECARGAS SET DATA_ATIVACAO=:0, DATA_EXPIRACAO=:1, SITUACAO_RECARGA='ATIVA' WHERE COD_BILHETE=:2 AND COD_RECARGA=:3";
                const dados = [data, dataexpiracao, codigo, codigorecarga]
                console.log(sql,dados);
                await conexao.execute(sql,dados);

                const sql2 = 'COMMIT';
		        await conexao.execute(sql2);	
            }
            catch(erro)
            {
                console.log(erro);
            }
        }
        if (tipo == 'BILHETE DUPLO')
        {
            const dataexpiracao = new Date()
            dataexpiracao.setMinutes(dataexpiracao.getMinutes() + 40)

            if(situacao == 'VÁLIDA')
            {
                try{
                    const sql = "UPDATE RECARGAS SET DATA_ATIVACAO=:0, DATA_EXPIRACAO=:1, SITUACAO_RECARGA='SEMI-ATIVA' WHERE COD_BILHETE=:2 AND COD_RECARGA=:3";
                    const dados = [data, dataexpiracao, codigo, codigorecarga]
                    console.log(sql,dados);
                    await conexao.execute(sql,dados);

                    const sql2 = 'COMMIT';
		            await conexao.execute(sql2);	
                }
                catch(erro)
                {
                    console.log(erro);
                }
            }
            else
            {
                try{
                    const sql = "UPDATE RECARGAS SET DATA_EXPIRACAO = :0 , SITUACAO_RECARGA='ATIVA' WHERE COD_BILHETE=:1 AND COD_RECARGA=:3";
                    const dados = [dataexpiracao, codigo, codigorecarga];
                    console.log(sql, dados)
                    await conexao.execute(sql,dados);

                    const sql2 = 'COMMIT';
                    await conexao.execute(sql2);
                }
                catch(erro)
                {
                    console.log(erro);
                }
            }
        }
        if (tipo == 'BILHETE DE 7 DIAS')
        {
            const dataexpiracao = new Date()
            dataexpiracao.setDate(dataexpiracao.getDate() + 7)

            try{
                const sql = "UPDATE RECARGAS SET DATA_ATIVACAO=:0, DATA_EXPIRACAO=:1, SITUACAO_RECARGA='ATIVA' WHERE COD_BILHETE=:2 AND COD_RECARGA=:3";
                const dados = [data, dataexpiracao, codigo, codigorecarga]
                console.log(sql,dados);
                await conexao.execute(sql,dados);

                const sql2 = 'COMMIT';
		        await conexao.execute(sql2);	
            }
            catch(erro)
            {
                console.log(erro);
            }
        }
        if (tipo == 'BILHETE DE 30 DIAS')
        {
            const dataexpiracao = new Date()
            dataexpiracao.setDate(dataexpiracao.getDate() + 30)

            try{
                const sql = "UPDATE RECARGAS SET DATA_ATIVACAO=:0, DATA_EXPIRACAO=:1, SITUACAO_RECARGA='ATIVA' WHERE COD_BILHETE=:2 AND COD_RECARGA=:3";
                const dados = [data, dataexpiracao, codigo, codigorecarga]
                console.log(sql,dados);
                await conexao.execute(sql,dados);

                const sql2 = 'COMMIT';
		        await conexao.execute(sql2);	
            }
            catch(erro)
            {
                console.log(erro);
            }
        }
	}
    this.atualizar2 = async function (recarga)
	{
		const conexao = await this.bd.getConexao();

        try {
            const sql = "UPDATE RECARGAS SET SITUACAO_RECARGA='EXPIRADA' WHERE COD_BILHETE=:0 AND COD_RECARGA=:1";
            const dados = [recarga.codigo, recarga.codigorecarga]
            console.log(sql,dados);
            await conexao.execute(sql,dados);

            const sql2 = 'COMMIT';
		    await conexao.execute(sql2);
        }
        catch(erro)
        {
            console.log(erro)
        }		
	}
}

function Utilizacoes (bd)
{
    process.env.ORA_SDTZ = 'UTC-3'; // garante horário de Brasília
	this.bd = bd;
	
	this.utilizar = async function (utilizacao, data)
	{
		const conexao = await this.bd.getConexao();
		
		const sql1 = "INSERT INTO UTILIZACOES (COD_BILHETE, COD_RECARGA, TIPO_RECARGA, DATA_UTILIZACAO)" + "VALUES (:0, :1, :2, :3)";
		const dados = [utilizacao.codigo, utilizacao.codigorecarga, utilizacao.tiporecarga, data];
		console.log(sql1, dados);
		await conexao.execute(sql1,dados);
		
		const sql2 = 'COMMIT';
		await conexao.execute(sql2);	
	}
    this.testar = async function (utilizacao, data)
	{
		const conexao = await this.bd.getConexao();
		
		const sql = "SELECT TO_CHAR(DATA_UTILIZACAO, 'DD-MM-YYYY HH24:MI:SS') " +
		            "FROM UTILIZACOES WHERE COD_RECARGA=:0 AND DATA_UTILIZACAO=:1";
		const dados = [utilizacao.codigorecarga, data];
        console.log(sql,dados)

		ret =  await conexao.execute(sql,dados);
		
		return ret.rows;
	}
    this.deletar = async function (utilizar, data)
    {
        const conexao = await this.bd.getConexao();
        try{
            const sql = "DELETE FROM UTILIZACOES  WHERE COD_RECARGA = :0 AND DATA_UTILIZACAO = :1 "
            const dados = [utilizar.codigorecarga, data];
            console.log(sql, dados);

            await conexao.execute(sql, dados);

            const sql2 = 'COMMIT';
            await conexao.execute(sql2);	
        }
        catch(erro)
        {
            console.log(erro)
        }
    }
    this.recupereUtilizacao = async function (codigo)
	{
		const conexao = await this.bd.getConexao();
		
		const sql = "SELECT TO_CHAR(DATA_UTILIZACAO, 'DD-MM-YYYY HH24:MI:SS'), COD_RECARGA, TIPO_RECARGA " +
		            "FROM UTILIZACOES WHERE COD_BILHETE=:0";
		const dados = [codigo];
        console.log(sql, dados)

		ret =  await conexao.execute(sql,dados);
        console.log(ret)
		
		return ret.rows;
	}
}



function Bilhete (codigo,dataentrada, horaentrada)
{
	    this.codigo = codigo;
	    this.dataentrada  = dataentrada;
        this.horaentrada = horaentrada;
}

function Recarga (codigo,codigorecarga,tiporecarga, datarecarga, situacaorecarga, dataativacao, dataexpiracao)
{
	    this.codigo = codigo;
        this.codigorecarga = codigorecarga;
	    this.tiporecarga  = tiporecarga;
        this.datarecarga = datarecarga;
        this.situacaorecarga = situacaorecarga;
        this.dataativacao = dataativacao;
        this.dataexpiracao = dataexpiracao
}

function Utilizar (codigo, codigorecarga, tiporecarga, datautilizacao)
{
    this.codigo = codigo;
    this.codigorecarga = codigorecarga;
    this.tiporecarga = tiporecarga;
    this.datautilizacao = datautilizacao;
}

function middleWareGlobal (req, res, next)
{
    console.time('Requisição'); // marca o início da requisição
    console.log('Método: '+req.method+'; URL: '+req.url); // retorna qual o método e url foi chamada

    next(); // função que chama as próximas ações

    console.log('Finalizou'); // será chamado após a requisição ser concluída

    console.timeEnd('Requisição'); // marca o fim da requisição
}

async function inclusao (req, res)
{
    if (!req.body.codigo)
    {
        const erro1 = new Comunicado ('DdI','Dados incompletos',
		                  'Não foram informados todos os dados do bilhete');
        return res.status(422).json(erro1);
    }
    
    const bilhete = new Bilhete (req.body.codigo,req.body.dataentrada,req.body.horaentrada);

    try
    {
        await  global.bilhetes.inclua(bilhete);
        const  sucesso = new Comunicado ('IBS','Inclusão bem sucedida',
		                  'O bilhete foi incluído com sucesso');
        return res.status(201).json(sucesso);
	}
	catch (erro)
	{
		console.log('TESTE AQUI');
		const  erro2 = new Comunicado ('LJE','Bilhete existente',
		                  'Já há bilhete cadastrado com o código informado');
        console.log(erro)
        return res.status(409).json(erro2);
    }
}

async function recarga (req, res)
{
    if (!req.body.codigo)
    {
        const erro1 = new Comunicado ('DdI','Dados incompletos',
		                  'Não foram informados todos os dados do bilhete');
        return res.status(422).json(erro1);
    }
    
    const recarga = new Recarga (req.body.codigo,req.body.codigorecarga,req.body.tiporecarga,req.body.datarecarga, req.body.situacaorecarga, req.body.dataativacao);

    rec = await global.recargas.buscarBilhete(recarga);
    console.log(rec);

    if (rec != '')
    {
        try
        {
        await  global.recargas.recarga(recarga);
        const  sucesso = new Comunicado ('IBS','Inclusão bem sucedida',
		                  'O bilhete foi incluído com sucesso');
        return res.status(201).json(sucesso);
	    }
	    catch (erro)
	    {
		console.log('TESTE AQUI');
		const  erro2 = new Comunicado ('LJE','Erro na inclusão',
		                  'Ocorrencia de algum erro na tentativa de inclusao');
        console.log(erro)
        return res.status(409).json(erro2);
        }
    }
    else
    {
        const  erro2 = new Comunicado ('LJE','Bilhete inexistente',
        'Bilhete não encontrado para cadastro da recarga');
        console.log(erro2)
        return res.status(409).json(erro2);
    }
}

async function utilizar (req, res) 
{
    console.log(req.body);
    if (!req.body.codigo)
    {
        const erro1 = new Comunicado ('DdI','Dados incompletos',
		                  'Não foram informados todos os dados do bilhete');
        return res.status(422).json(erro1);
    }
    
    const utilizar = new Utilizar (req.body.codigo,req.body.codigorecarga,req.body.tiporecarga,req.body.datautilizacao);
    const recarga = new Recarga (req.body.codigo,req.body.codigorecarga,req.body.tiporecarga,req.body.datarecarga, req.body.situacaorecarga, req.body.dataativacao);
    const codigo = req.params.codigo
    const codigorecarga = req.params.codigorecarga
    const data = new Date();

    let rec;
	try
	{
	    rec = await global.recargas.recupereRecarga(codigo, codigorecarga);
        console.log(rec)
    }    
    catch(erro)
    {
        console.log(erro);
    }

    if (rec[0][0] == 'EXPIRADA')
    {
        const expirada = new Comunicado ('LJE', 'Recarga expirada', 
        'A recarga selecionada está expirada');

        return res.status(409).json(expirada);
    }

    if (rec[0][0] == 'SEMI-ATIVA') // THIS PART, FOR CHECK IF THE UTILIZATION IS INSIDE OF TIME OF UTILIZATION, WE MAKE A AUXILIARY INSERTION IN THE TABLE UTILIZAÇÕES, THAN WE GET THIS DATE DATA AND COMPARE WITH THE EXPIRATION TIME OF THE TICKET

    {
        await global.utilizar.utilizar(utilizar, data);
        teste = await global.utilizar.testar(utilizar, data);

        if (teste[0][0] <= rec[0][3])
        {
            const  sucesso = new Comunicado ('IBS','Utilização bem sucedida',
            'O bilhete foi utilizado com sucesso');
            return res.status(201).json(sucesso);  
        }
        else
        {
            await global.recargas.atualizar(codigo, codigorecarga, rec[0][1], rec[0][0])
            const  sucesso = new Comunicado ('IBS','Utilização da segunda recarga bem sucedida',
		                      'O bilhete foi utilizado com sucesso');
            return res.status(201).json(sucesso);

        }
    }
    
    if (rec[0][2] == null)
    {
        try{
            await global.utilizar.utilizar(utilizar, data);
            await global.recargas.atualizar(codigo, codigorecarga, rec[0][1], rec[0][0]);
            const  sucesso = new Comunicado ('IBS','Utilização bem sucedida',
		                      'O bilhete foi utilizado com sucesso');
            return res.status(201).json(sucesso);
        }
        catch (erro)
	    {
		    console.log('TESTE AQUI');
		    const  erro2 = new Comunicado ('LJE','Erro na utilização existente',
		                      'Ocorrência de algum erro na utilização');
            console.log(erro)
            return res.status(409).json(erro2);
        }
    }
    else
    {
        await global.utilizar.utilizar(utilizar, data);
        teste = await global.utilizar.testar(utilizar, data);

        if(teste[0][0] <= rec[0][3])
        {
            const  sucesso = new Comunicado ('IBS','Utilização bem sucedida',
            'O bilhete foi utilizado com sucesso');
            return res.status(201).json(sucesso);
        }
        else
        {
            await global.utilizar.deletar(utilizar, teste[0][0]);
            const expirada = new Comunicado ('LJE', 'Recarga expirada', 
                                 'A recarga selecionada está expirada');

            await global.recargas.atualizar2(recarga)
            
            return res.status(409).json(expirada);
        }

    }
}

async function recuperacaoDeUm (req, res)
{
    if (req.body.codigo)
    {
        const erro1 = new Comunicado ('JSP','JSON sem propósito',
		                  'Foram disponibilizados dados em um JSON sem necessidade');
        return res.status(422).json(erro1);
    }

    const codigo = req.params.codigo;
    
    let rec;
	try
	{
	    rec = await global.recargas.recupereUm(codigo);
        console.log(rec)
    }    
    catch(erro)
    {
        console.log(erro);
    }

	if (rec.length == 0 )
	{
		const erro2 = new Comunicado ('LNE','Bilhete sem recarga',
		                  'Não há recargas no bilhete');
		return res.status(404).json(erro2);
	}
    else
	{
		const ret=[];
		for (i=0;i<rec.length;i++) ret.push (new Recarga (rec[i][0],rec[i][1],rec[i][2],rec[i][4], rec[i][3], rec[i][5], rec[i][6]));
		return res.status(200).json(ret);
	}
}

async function relatorio (req, res)
{
    if (req.body.codigo)
    {
        const erro1 = new Comunicado ('JSP','JSON sem propósito',
		                  'Foram disponibilizados dados em um JSON sem necessidade');
        return res.status(422).json(erro1);
    }

    const codigo = req.params.codigo;
    
    let recarga;
    let bilhete;
	try
	{
	    bilhete = await global.bilhetes.relatorio(codigo);
        recarga = await global.recargas.recupereUm(codigo);
        utilizar = await global.utilizar.recupereUtilizacao(codigo);
        console.log(bilhete)
        console.log(recarga)
        console.log(utilizar)
    }    
    catch(erro)
    {
        console.log(erro);
    }

    
	 if (bilhete.length == 0)
	 {
	 	const erro2 = new Comunicado ('LNE','Bilhete não encontrado',
	 	                  'Não há bilhete com o código digitado');
	 	return res.status(404).json(erro2);
	 }
     else
	 {
	 	const ret=[];
	 	for (i=0;i<bilhete.length;i++) ret.push (new Bilhete (bilhete[i][0],bilhete[i][1]));
	 	for (i=0;i<recarga.length;i++) ret.push (new Recarga (recarga[i][0],recarga[i][1],recarga[i][2],recarga[i][4], recarga[i][3], recarga[i][5], recarga[i][6]));
        for (i=0;i<utilizar.length;i++) ret.push (new Utilizar (null, utilizar[i][1], utilizar[i][2], utilizar[i][0]));
        console.log(ret);
	 	return res.status(200).json(ret);
	}
} 

function Comunicado (codigo,mensagem,descricao)
{
	this.codigo    = codigo;
	this.mensagem  = mensagem;
	this.descricao = descricao;
}

async function ativacaoDoServidor ()
{
    const bd = new BD ();
	await bd.estrutureSe();
    await bd.estrutureSe2();
    await bd.estrutureSe3();
    global.bilhetes = new Bilhetes(bd);
    global.recargas = new Recargas(bd);
    global.utilizar = new Utilizacoes(bd);

    const express = require('express');
    const app     = express();
	const cors    = require('cors')
    
    app.use(express.json());   // faz com que o express consiga processar JSON
	app.use(cors()) //habilitando cors na nossa aplicacao (adicionar essa lib como um middleware da nossa API - todas as requisições passarão antes por essa biblioteca).
    app.use(middleWareGlobal) // app.use cria o middleware global

    app.post  ('/bilhetes'        , inclusao); 
    app.post  ('/recargas'        , recarga); 
    app.get   ('/bilhetes/:codigo'        , relatorio);
    app.get   ('/recargas/:codigo'        , recuperacaoDeUm);
    app.post  ('/utilizacao/:codigo/:codigorecarga' ,utilizar);

    console.log ('Servidor ativo na porta 3000...');
    app.listen(3000);
}

ativacaoDoServidor();