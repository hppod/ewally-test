# EWally Test
## Instruções para execução

 1. Clone o projeto do GitHub
 2. Caso nunca tenha executado o projeto na sua máquina, rode o comando **npm run firstUse**. Ele instalará as dependências do projeto e automaticamente irá iniciar a API na porta 8080.
 3. Caso já tenha instalado as dependências anteriormente, execute o comando **npm start**. Ele iniciará a API na porta 8080.
 4. Para realizar os testes, rode o comando **npm test** sem que a API esteja rodando. Caso execute o comando com a API já em funcionamento, os testes falharão pois a porta 8080 já estará em uso.
 
 ## Endpoint
 
 1. O endpoint disponivel para envio das informações de boleto é **/boleto/:linhaDigitavel** no método **GET**. Para enviar a request pode ser utilizado o próprio navegador, o comando wget ou plataforma de testes de API, como postman.
 2. Exemplo: **http://localhost:8080/boleto/26090233003935477071958200000006889280000111184**
 3. O endpoint retornará **200** em caso de sucesso e no corpo da resposta as informações extraídas da linha digitável, quando disponíveis.
 4. Caso haja algum erro linha digitável informada, o endpoint retornará **400** e no corpo da resposta informará o que há de errado com a linha digitável informada.
 5. Caso não seja informada nenhuma linha digitável, o endpoint retornará **404** pois não encontrou o endereço na API.