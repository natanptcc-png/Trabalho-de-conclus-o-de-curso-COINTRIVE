### PROJETO FINAL DO TCC

Esse projeto foi usado como um trabalho de conclusão de curso para o meu curso técnico em Desenvolvimento de Sistemas.

*09/06/2026* O projeto foi inicializado com a estruturação inicial do Backend.

*01/07/2026* O projeto foi refeito do zero com base nos protótipos realizados como as fidelidades baixa, média e alta.

*09/07/2026* Foi atualizado a tela de dashboard, adicionado a logo do projeto e icone, criado a tela de transações de acordo com o protótipo, ajustado as telas para celular

*11/07/2026* Foi finalizado o projeto com as informações abaixo

---
````
FEATURES ADICIONADAS

*FRONTEND*
Ajustado Dashboard para funcionar como originalmente intencionado
Arrumado tela de Transações para permitir a edição, deleção, e funcionar de acordo com o backend
Distribuição de dados iguais entre as páginas, e utilizar os dados fornecido pela API no Backend
Finalizado o modal de criação e edição de transação
Finalizado exportação de transações visíveis para arquivo Excel
Finalizado a tela de relatórios e filtragem de tempo para o relatório
Finalizado a funcionalidade nas configurações para permitir os usuários alterarem seu Nome, Sobrenome e Senha e atualizar o banco de dados
Finalizado o Modo Escuro e Notificações nas configurações
Feito o AutoLogin se o usuário reiniciou a página estando logado
Finalizado a tela de Log In e Cadastro de usuários
Finalizado a adaptação do projeto para celular
Conexão do frontend com a API fornecida pelo backend

*BACKEND*
Adicionado a conexão do banco de dados do MySQL com a API criada em ExpressJS
Adicionado dos métodos GET, POST, PATCH, PUT e DELETE da API para os seguintes acessos de dados:
---> Receber os usuários e usuários por ID
---> Criar usuário após cadástro e salvar no banco com a senha criptografada pelo bcrypt
---> Logar o usuário caso as credenciais estiverem corretas e gerar o token JWT, e procurar se o usuário existe no banco
---> Pegar a lista de transações de um usuário
---> Criar uma transação nova com os dados que usuário enviar para o backend
---> Deletar uma transação de um usuário caso ele exista