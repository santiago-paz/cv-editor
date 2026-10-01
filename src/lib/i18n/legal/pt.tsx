import Link from "next/link";
import { KEEP } from "@/lib/keep";
import { OPERATOR } from "@/lib/operator";
import type { LegalText } from "./types";

/* The privacy and terms pages in Brazilian Portuguese. They follow en.tsx
   section by section, and tests/i18n.test.ts counts the headings, lists, links
   and numbers against it. The country is written out, because that test pins
   it to Argentina. The notice from Ley 25.326 stays in Spanish, as the law
   asks. When en.tsx changes, change this file in step. */

const pt: LegalText = {
  back: "Voltar ao editor",
  language: "Idioma",
  updated: date => `Última atualização em ${date}`,

  privacy: {
    title: "Privacidade",
    description: "O que o CV Editor guarda, onde e por quanto tempo.",
    body: (
      <>
        <p>
          Você pode usar o editor sem conta, e seus currículos ficam no seu navegador. Nunca guardamos uma cópia do seu
          currículo no nosso servidor.
        </p>

        <h2>Quem mantém o editor</h2>
        <p>
          {OPERATOR.name} mantém o CV Editor a partir da Argentina e é responsável pelos dados desta página. Escreva
          para <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>.{" "}
          {OPERATOR.address
            ? `Endereço postal: ${OPERATOR.address}.`
            : "Se precisar de um endereço postal, escreva para esse e-mail."}
        </p>

        <h2>O que fica no seu navegador</h2>
        <p>
          Seus currículos, sua foto e suas configurações são salvos no armazenamento do seu navegador, neste
          dispositivo. Se você ativar “Esquecer meus currículos ao fechar esta aba” em Configurações, eles ficam só
          nessa aba e são excluídos quando você a fecha. Para guardar uma cópia em outro lugar, use Fazer backup em
          Configurações.
        </p>
        <p>
          Salvar como PDF, o botão principal no computador, cria o arquivo no seu navegador, com a caixa de impressão
          dele. Nada é enviado.
        </p>

        <h2>Quando seu currículo chega ao nosso servidor</h2>
        <ul>
          <li>
            Quando você escolhe “Baixar um arquivo PDF”, seu navegador envia o currículo ao nosso servidor. O servidor
            imprime o currículo em PDF e devolve o arquivo. Ele não guarda cópia do currículo nem do PDF, nem registro
            de nenhum dos dois. No celular ou no tablet, o botão principal faz isso.
          </li>
          <li>
            Quando você usa “Melhorar com IA”, seu navegador envia o texto desse bloco, o cargo ou o título acima dele,
            as datas do emprego e o idioma do currículo. Passamos esses dados à API Claude, da Anthropic, que escreve a
            sugestão. Não guardamos o texto. Os termos comerciais da Anthropic dizem que ela não treina seus modelos com
            esses dados. Ela exclui o que recebe em até 30 dias e só guarda por mais tempo se as verificações de
            segurança dela sinalizarem esses dados ou se a lei exigir. Seu nome, seus dados de contato, sua foto e o
            resto do seu currículo nunca são enviados. Por favor, não coloque dados de saúde, religião, política ou
            sindicato no bloco que você envia.
          </li>
        </ul>

        <h2>Contas</h2>
        <p>
          Você só precisa de uma conta para as reescritas com IA, e entra com o Google. Você deve ter 16 anos ou mais.
          Guardamos:
        </p>
        <ul>
          <li>seu nome e seu endereço de e-mail, como o Google os envia, e o ID da conta do Google que os vincula;</li>
          <li>
            uma sessão de login para cada dispositivo, para que você continue conectado. Ela contém um token aleatório
            e uma data de expiração. Ela dura {KEEP.sessionDays} dias depois do último uso;
          </li>
          <li>
            uma linha para cada reescrita com IA: quando aconteceu, quantos tokens usou e se você usou a sugestão.
            Nunca o texto.
          </li>
        </ul>
        <p>
          Não guardamos seu endereço IP, os detalhes do seu navegador, sua foto de perfil do Google nem os tokens que o
          Google emite quando você entra. Excluir conta, em Configurações, remove tudo de uma vez. Para desfazer também
          o vínculo com o Google, remova o CV Editor em{" "}
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener">
            myaccount.google.com/permissions
            <span className="sr-only"> (abre em uma nova aba)</span>
          </a>
          .
        </p>

        <h2>Cookies</h2>
        <p>Não há cookies até você entrar. Ao entrar, são criados dois cookies, e os dois são necessários:</p>
        <ul>
          <li>
            <code translate="no">__Secure-better-auth.session_token</code> mantém você conectado. Ele dura{" "}
            {KEEP.sessionDays} dias e é renovado a cada dia em que você usa o editor.
          </li>
          <li>
            <code translate="no">__Secure-better-auth.state</code> confirma que o login veio de você. Ele dura 5
            minutos.
          </li>
        </ul>
        <p>
          Seus currículos e configurações ficam no armazenamento do seu navegador, e não em cookies. Não há anúncios e
          não rastreamos você entre sites. A contagem de visitas descrita abaixo também não usa cookies.
        </p>

        <h2>Visitas e registros</h2>
        <p>
          A Vercel, que hospeda o site, vê o endereço IP de cada visita. Ela usa o endereço para entregar o site e para
          limitar quantos PDFs um mesmo endereço pode pedir por minuto. O aviso de privacidade da própria Vercel diz por
          quanto tempo ela guarda os registros. Não guardamos endereços IP no nosso banco de dados.
        </p>
        <p>
          Também contamos as visitas, com o Web Analytics da Vercel. Ele não usa cookies, e as contagens não têm
          endereço IP nem nome. De cada visita, ele registra a hora, a página, o site de onde você veio, seu país, sua
          região e sua cidade, o tipo de dispositivo e seu navegador e sistema. Para distinguir os visitantes, ele usa
          um código criado a partir da requisição. A Vercel apaga esse código após 24 horas, e depois disso nada liga
          uma visita à seguinte. Só vemos totais, como as visitas por página ou por país, para saber quantas pessoas
          usam o editor.
        </p>

        <h2>Quem lida com os dados</h2>
        <ul>
          <li>A Vercel hospeda o site, opera o servidor e conta as visitas, nos Estados Unidos.</li>
          <li>A Neon armazena as contas e a contagem de reescritas, nos Estados Unidos.</li>
          <li>A Anthropic escreve as sugestões da IA, nos Estados Unidos.</li>
          <li>O Google cuida do login, conforme a própria política de privacidade.</li>
          <li>O PayPal cuida das doações, no próprio site, só se você clicar em Doar.</li>
        </ul>
        <p>
          A Argentina não inclui os Estados Unidos na lista de países com proteção de dados adequada. Quando você entra, escolhe “Baixar um arquivo PDF” ou usa a IA, você concorda que seus dados sejam processados lá. Usamos a Vercel, a Neon e a
          Anthropic sob os termos de processamento de dados de cada uma.
        </p>

        <h2>Por que usamos seus dados</h2>
        <ul>
          <li>Para criar seu PDF e escrever suas sugestões de IA, porque você pede isso.</li>
          <li>Para manter sua conta, porque você a cria e concorda com isso.</li>
          <li>
            Para contar as reescritas, aplicar os limites e impedir abusos, de modo que o teste gratuito da IA fique
            dentro do orçamento.
          </li>
          <li>Para contar as visitas e saber quantas pessoas usam o editor.</li>
        </ul>
        <p>
          Se você está na UE ou no Reino Unido, a base legal é o contrato para os dois primeiros e o legítimo interesse
          para os dois últimos.
        </p>

        <h2>Por quanto tempo guardamos os dados</h2>
        <ul>
          <li>Currículos e PDFs: não guardamos.</li>
          <li>Texto da IA: não guardamos. A Anthropic exclui em até 30 dias.</li>
          <li>
            Sessões de login: {KEEP.sessionDays} dias depois do último uso. Excluímos as expiradas automaticamente.
          </li>
          <li>Linhas de reescrita com IA: {KEEP.rewriteMonths} meses, e depois as excluímos.</li>
          <li>
            Sua conta: até você excluí-la. Também excluímos uma conta que está há {KEEP.idleAccountMonths} meses sem
            nenhuma reescrita com IA.
          </li>
          <li>Contagem de visitas: a Vercel nos mostra os últimos 12 meses.</li>
        </ul>
        <p>Quando excluímos dados, cópias podem ficar em backups do banco de dados por pouco tempo.</p>

        <h2>Seus direitos</h2>
        <p>Você pode perguntar o que guardamos sobre você e pedir que os dados sejam corrigidos ou excluídos.</p>
        <ul>
          <li>O acesso é gratuito. Você pode pedir uma vez a cada 6 meses, e respondemos em até 10 dias.</li>
          <li>Corrigimos ou excluímos seus dados em até 5 dias úteis depois do seu pedido.</li>
          <li>
            Excluir conta, em Configurações, exclui os dados da sua conta de uma vez. Fazer backup, em Configurações,
            salva seus currículos em um arquivo.
          </li>
        </ul>
        <p>Para fazer um pedido, escreva para o e-mail acima. Envie a mensagem do endereço que a sua conta usa.</p>
        <p>A lei de proteção de dados da Argentina, a Ley&nbsp;25.326, pede que mostremos este aviso:</p>
        <p lang="es">
          El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma
          gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme
          lo establecido en el artículo 14, inciso 3 de la Ley Nº 25.326. La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA,
          en su carácter de Órgano de Control de la Ley Nº 25.326, tiene la atribución de atender las denuncias y
          reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes
          en materia de protección de datos personales.
        </p>
        <p>
          Em português simples: você pode pedir acesso gratuito aos seus dados em intervalos de pelo menos 6 meses, a
          menos que demonstre um interesse legítimo. A Agencia de Acceso a la Información Pública, a AAIP, supervisiona
          a Ley&nbsp;25.326 e atende às reclamações sobre violações das regras de proteção de dados.
        </p>

        <h2>Reclamações</h2>
        <p>
          Se não conseguirmos resolver a questão com você, você pode apresentar uma reclamação à AAIP, a autoridade de
          proteção de dados da Argentina, em{" "}
          <a href="https://www.argentina.gob.ar/aaip" target="_blank" rel="noopener">
            argentina.gob.ar/aaip
            <span className="sr-only"> (abre em uma nova aba)</span>
          </a>
          . Se você mora na UE ou no Reino Unido, também pode apresentar uma reclamação à autoridade local de proteção
          de dados.
        </p>

        <p>
          Os <Link href="/terms">Termos</Link> definem as regras para usar o editor.
        </p>
      </>
    ),
  },

  terms: {
    title: "Termos",
    description: "As poucas regras para usar o CV Editor.",
    body: (
      <>
        <ul>
          <li>
            {OPERATOR.name} mantém o CV Editor a partir da Argentina. O uso é gratuito, e você não precisa de uma conta.
          </li>
          <li>
            O que você escreve é seu. Não reivindicamos nenhum direito sobre seus currículos. As sugestões da IA são
            suas para usar depois que você as colocar no seu currículo.
          </li>
          <li>
            Leia cada sugestão da IA antes de usá-la, porque ela pode estar errada. Mantenha seu currículo verdadeiro.
          </li>
          <li>
            A IA funciona com o Claude, da Anthropic. Use-a para melhorar o seu próprio currículo, siga a{" "}
            <a href="https://www.anthropic.com/legal/aup" target="_blank" rel="noopener">
              política de uso
              <span className="sr-only"> (abre em uma nova aba)</span>
            </a>{" "}
            da Anthropic e não tente contornar os limites dela. Podemos mudar ou parar a IA a qualquer momento. É um
            teste gratuito.
          </li>
          <li>
            Para criar uma conta, você deve ter 16 anos ou mais. Podemos encerrar uma conta que abuse da IA ou do serviço
            de PDF, por exemplo, com scripts que enviam solicitações em massa.
          </li>
          <li>Uma doação é um presente. Ela não compra nenhuma funcionalidade e não dá nenhum direito extra.</li>
          <li>
            O editor é oferecido como está. Tentamos mantê-lo funcionando, mas não podemos prometer que ele estará sempre
            disponível nem livre de erros, por isso faça um backup dos seus currículos. Até onde a lei permite, não somos
            responsáveis por perdas que vêm de usar o editor ou de confiar em uma sugestão da IA.
          </li>
          <li>
            Estes termos seguem as leis da Argentina. Todos os direitos que protegem você como consumidor onde você mora
            continuam valendo.
          </li>
          <li>
            Podemos mudar estes termos ou o editor. Se uma mudança for importante, esta página vai avisar e mostrar uma
            nova data.
          </li>
        </ul>
        <p>
          A <Link href="/privacy">Privacidade</Link> explica o que o editor guarda e onde. Se tiver dúvidas sobre estes
          termos, escreva para <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>.
        </p>
      </>
    ),
  },
};

export default pt;
