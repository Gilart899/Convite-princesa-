# Organização desta versão

Esta pasta é a base limpa para substituir o conteúdo antigo do repositório.

Foram removidos da nova estrutura:
- ZIPs de versões antigas;
- inicializadores Firebase duplicados;
- arquivos sem uso definido;
- configurações apontando para outros projetos Firebase;
- gravações diretas inseguras de reservas pelo navegador;
- lógica de prêmio da raspadinha no frontend.

A nova base concentra:
- uma única configuração Firebase em `js/config.js`;
- uma única conexão em `js/firebase.js`;
- frontend separado em `js/` e `css/`;
- backend em `functions/`;
- regras do Realtime Database em um único arquivo;
- imagens sem ZIPs dentro do projeto.
