# Rifa Solidária — Dona Bené

Reestruturação limpa do projeto, sem os ZIPs antigos e sem múltiplas inicializações Firebase.

## Firebase correto
- Projeto: `rifa-c7060`
- Número do projeto: `376168190630`
- Realtime Database: `https://rifa-c7060-default-rtdb.firebaseio.com`

## Antes de publicar
1. No Firebase Console, abra o projeto `rifa-c7060`.
2. Crie um aplicativo Web (ícone `</>`).
3. Copie a configuração Web gerada para `js/config.js`.
4. Ative Authentication > Sign-in method > E-mail/senha.
5. Crie o usuário administrador em Authentication e anote o UID.
6. No Realtime Database, depois de publicar as regras, a associação inicial do UID deverá ser feita por uma rotina administrativa segura (não pelo site público).
7. Publique as regras do arquivo `database.rules.json`.
8. Instale as dependências em `functions/` e publique as Cloud Functions.

O projeto não contém credenciais privadas. A configuração Web do Firebase possui identificadores que o próprio Firebase considera não secretos, mas ela deve ser obtida do aplicativo Web correto. Não reutilize a configuração de outro projeto.

## Estrutura
- `index.html`: apresentação principal
- `cartela.html`: 10 cartelas / 1.000 números
- `reserva.html`: confirmação da seleção
- `raspadinha.html`: tela da raspadinha
- `admin.html`: painel administrativo
- `js/`: JavaScript do frontend
- `css/`: estilos
- `functions/`: lógica de backend
- `img/`: imagens aproveitadas das versões anteriores
- `database.rules.json`: regras fechadas por padrão

## Segurança
A gravação de reservas e a criação de jogadas da raspadinha devem ocorrer por Cloud Functions. Prêmios, novas chances e resultados não são colocados no JavaScript público.
