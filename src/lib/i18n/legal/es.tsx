import Link from "next/link";
import { KEEP } from "@/lib/keep";
import { OPERATOR } from "@/lib/operator";
import type { LegalText } from "./types";

/* The privacy and terms pages in Spanish: informal "tú", neutral for Spain and
   Latin America. It follows en.tsx sentence by sentence, with the same sections,
   lists and links. The windows come from keep.ts and the operator from
   operator.ts, so a number here cannot drift from the code that enforces it.
   The notice that Ley 25.326 asks for is Spanish already, so it stays word for
   word. The names of buttons and menus are the ones in src/lib/i18n/es.tsx. */

const es: LegalText = {
  back: "Volver al editor",
  language: "Idioma",
  updated: date => `Última actualización: ${date}`,

  privacy: {
    title: "Privacidad",
    description: "Qué guarda el CV Editor, dónde y por cuánto tiempo.",
    body: (
      <>
        <p>
          Puedes usar el editor sin cuenta, y tus CV se quedan en tu navegador. Nunca guardamos una copia de tu CV en
          nuestro servidor.
        </p>

        <h2>Quién está a cargo</h2>
        <p>
          {OPERATOR.name} gestiona el CV Editor desde Argentina y es responsable de los datos que describe esta página.
          Escribe a <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>.{" "}
          {OPERATOR.address
            ? `Dirección postal: ${OPERATOR.address}.`
            : "Para pedir la dirección postal, escribe a ese correo."}
        </p>

        <h2>Qué se queda en tu navegador</h2>
        <p>
          Tus CV, tu foto y tus ajustes se guardan en el almacenamiento de tu navegador, en este dispositivo. Si activas
          “Olvidar mis CV al cerrar esta pestaña” en Ajustes, se quedan solo en esa pestaña, y al cerrarla se eliminan.
          Para conservar una copia en otro sitio, usa “Guardar copia” en Ajustes.
        </p>
        <p>
          Guardar como PDF, el botón principal en una computadora, crea el archivo en tu navegador con su propio
          cuadro de impresión. No envía nada.
        </p>

        <h2>Cuándo tu CV llega a nuestro servidor</h2>
        <ul>
          <li>
            Cuando eliges “Descargar un archivo PDF”, tu navegador envía el CV a nuestro servidor. El servidor lo
            imprime y te devuelve el archivo. No guarda ninguna copia del CV ni del PDF, ni deja registro de ninguno
            de los dos. En un teléfono o una tableta, el botón principal hace esto.
          </li>
          <li>
            Cuando usas “Mejorar con IA”, tu navegador envía el texto de ese bloque, el puesto o el título que va
            encima, las fechas del trabajo y el idioma del CV. Los pasamos a la API de Claude, de Anthropic, que escribe
            la sugerencia, y no guardamos el texto. Los términos comerciales de Anthropic dicen que no entrena sus
            modelos con estos datos. Anthropic elimina lo que recibe en un plazo de 30 días, y lo conserva más tiempo
            solo si sus controles de seguridad lo marcan o si la ley lo exige. Tu nombre, tus datos de contacto, tu foto
            y el resto de tu CV no se envían nunca. Por favor, no pongas datos de salud, religión, política o afiliación
            sindical en un bloque que envíes.
          </li>
        </ul>

        <h2>Cuentas</h2>
        <p>
          Solo necesitas una cuenta para las mejoras con IA, y inicias sesión con Google. Debes tener 16 años o más.
          Guardamos:
        </p>
        <ul>
          <li>
            tu nombre y tu dirección de correo electrónico, tal como los envía Google, y el ID de la cuenta de Google
            que los vincula;
          </li>
          <li>
            una sesión de acceso para cada dispositivo, para que mantengas la sesión iniciada. Contiene un token
            aleatorio y una fecha de vencimiento. Dura {KEEP.sessionDays} días después del último uso;
          </li>
          <li>
            una fila por cada mejora con IA: cuándo ocurrió, cuántos tokens usó y si usaste la sugerencia. Nunca el
            texto.
          </li>
        </ul>
        <p>
          No guardamos tu dirección IP, los datos de tu navegador, tu foto de perfil de Google ni los tokens que Google
          emite cuando inicias sesión. “Eliminar cuenta”, en Ajustes, lo elimina todo de una vez. Para cortar también el
          vínculo con Google, quita CV Editor en{" "}
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener">
            myaccount.google.com/permissions
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </a>
          .
        </p>

        <h2>Cookies</h2>
        <p>No hay cookies hasta que inicias sesión. Al iniciar sesión se crean dos, y se necesitan las dos:</p>
        <ul>
          <li>
            <code translate="no">__Secure-better-auth.session_token</code> mantiene tu sesión iniciada. Dura{" "}
            {KEEP.sessionDays} días y se renueva cada día que usas el editor.
          </li>
          <li>
            <code translate="no">__Secure-better-auth.state</code> comprueba que el inicio de sesión viene de ti. Dura 5
            minutos.
          </li>
        </ul>
        <p>
          Tus CV y tus ajustes están en el almacenamiento de tu navegador, no en cookies. No hay anuncios y no te
          rastreamos entre sitios. El recuento de visitas que se describe más abajo tampoco usa cookies.
        </p>

        <h2>Visitas y registros</h2>
        <p>
          Vercel, que aloja el sitio, ve la dirección IP de cada visita. Usa la dirección para entregar el sitio y para
          limitar cuántos PDF puede pedir una misma dirección cada minuto. El propio aviso de privacidad de Vercel dice
          cuánto tiempo conserva sus registros. No guardamos direcciones IP en nuestra base de datos.
        </p>
        <p>
          También contamos las visitas, con Vercel Web Analytics. No usa cookies, y los recuentos no contienen
          direcciones IP ni nombres. De cada visita registra la hora, la página, el sitio desde el que llegaste, tu
          país, tu región y tu ciudad, el tipo de dispositivo, y tu navegador y tu sistema. Para distinguir a los
          visitantes usa un código creado a partir de la solicitud. Vercel elimina ese código después de 24 horas, y
          desde entonces nada une una visita con la siguiente. Solo vemos totales, como las visitas por página o por país,
          para saber cuántas personas usan el editor.
        </p>

        <h2>Quién maneja los datos</h2>
        <ul>
          <li>Vercel aloja el sitio, ejecuta el servidor y cuenta las visitas, en Estados Unidos.</li>
          <li>Neon guarda las cuentas y el recuento de mejoras con IA, en Estados Unidos.</li>
          <li>Anthropic escribe las sugerencias de la IA, en Estados Unidos.</li>
          <li>Google se encarga del inicio de sesión, según su propia política de privacidad.</li>
          <li>PayPal se encarga de las donaciones, en su propio sitio, solo si haces clic en “Donar”.</li>
        </ul>
        <p>
          Argentina no incluye a Estados Unidos entre los países con un nivel adecuado de protección de datos. Cuando
          inicias sesión, eliges “Descargar un archivo PDF” o usas la IA, aceptas que tus datos se procesen allí. Usamos Vercel, Neon y
          Anthropic bajo sus términos de procesamiento de datos.
        </p>

        <h2>Para qué usamos tus datos</h2>
        <ul>
          <li>Para crear tu PDF y escribir tus sugerencias de IA, porque tú lo pides.</li>
          <li>Para mantener tu cuenta, porque la creas y estás de acuerdo con ello.</li>
          <li>
            Para contar las mejoras, aplicar los límites y frenar el abuso. Así la prueba gratuita de la IA se mantiene
            dentro de su presupuesto.
          </li>
          <li>Para contar las visitas y saber cuántas personas usan el editor.</li>
        </ul>
        <p>
          Si estás en la UE o en el Reino Unido, la base legal es el contrato en los dos primeros y el interés legítimo
          en los dos últimos.
        </p>

        <h2>Cuánto tiempo guardamos tus datos</h2>
        <ul>
          <li>CV y PDF: no los guardamos.</li>
          <li>Texto de la IA: no lo guardamos. Anthropic lo elimina en un plazo de 30 días.</li>
          <li>
            Sesiones de acceso: {KEEP.sessionDays} días después del último uso. Eliminamos las vencidas de forma
            automática.
          </li>
          <li>Filas de mejoras con IA: {KEEP.rewriteMonths} meses, y luego las eliminamos.</li>
          <li>
            Tu cuenta: hasta que la elimines. También eliminamos una cuenta que lleva{" "}
            {KEEP.idleAccountMonths} meses sin ninguna mejora con IA.
          </li>
          <li>Recuento de visitas: Vercel nos muestra los últimos 12 meses.</li>
        </ul>
        <p>
          Cuando eliminamos datos, pueden quedar copias de ellos en las copias de seguridad de la base de datos durante
          un tiempo breve.
        </p>

        <h2>Tus derechos</h2>
        <p>Puedes preguntar qué datos tenemos sobre ti, pedir que los corrijamos o pedir que los eliminemos.</p>
        <ul>
          <li>
            El derecho de acceso es gratuito. Puedes pedirlo una vez cada 6 meses, y respondemos en un plazo de 10 días.
          </li>
          <li>Corregimos o eliminamos tus datos en un plazo de 5 días hábiles desde tu solicitud.</li>
          <li>
            “Eliminar cuenta”, en Ajustes, elimina de inmediato los datos de tu cuenta. “Guardar copia”, en Ajustes,
            guarda tus CV en un archivo.
          </li>
        </ul>
        <p>Para hacer tu solicitud, escribe al correo de arriba desde la dirección que usa tu cuenta.</p>
        <p>La ley argentina de protección de datos, la Ley&nbsp;25.326, nos pide incluir este aviso:</p>
        <p lang="es">
          El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma
          gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme
          lo establecido en el artículo 14, inciso 3 de la Ley Nº 25.326. La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA,
          en su carácter de Órgano de Control de la Ley Nº 25.326, tiene la atribución de atender las denuncias y
          reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes
          en materia de protección de datos personales.
        </p>
        <p>
          En otras palabras: puedes pedir acceso a tus datos de forma gratuita a intervalos de al menos 6 meses, salvo
          que acredites un interés legítimo. La Agencia de Acceso a la Información Pública, la AAIP, es el órgano de
          control de la Ley&nbsp;25.326 y atiende las denuncias y reclamos por incumplimiento de las normas de
          protección de datos.
        </p>

        <h2>Reclamos</h2>
        <p>
          Si no logramos resolverlo contigo, puedes presentar un reclamo ante la AAIP, la autoridad de protección de
          datos de Argentina, en{" "}
          <a href="https://www.argentina.gob.ar/aaip" target="_blank" rel="noopener">
            argentina.gob.ar/aaip
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </a>
          . Si vives en la UE o en el Reino Unido, también puedes presentar un reclamo ante tu autoridad local de
          protección de datos.
        </p>

        <p>
          Los <Link href="/terms">Términos</Link> fijan las reglas para usar el editor.
        </p>
      </>
    ),
  },

  terms: {
    title: "Términos",
    description: "Las pocas reglas para usar el CV Editor.",
    body: (
      <>
        <ul>
          <li>{OPERATOR.name} gestiona el CV Editor desde Argentina. Su uso es gratuito, y no necesitas una cuenta.</li>
          <li>
            Lo que escribes es tuyo. No reclamamos ningún derecho sobre tus CV. Cuando pones una sugerencia de la IA en
            tu CV, es tuya y puedes usarla.
          </li>
          <li>Lee cada sugerencia de la IA antes de usarla, porque puede estar equivocada. Mantén tu CV veraz.</li>
          <li>
            La IA funciona con Claude, de Anthropic. Úsala para mejorar tu propio CV, sigue la{" "}
            <a href="https://www.anthropic.com/legal/aup" target="_blank" rel="noopener">
              política de uso
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>{" "}
            de Anthropic y no intentes saltarte sus límites. Podemos cambiar o detener la IA en cualquier momento. Es una
            prueba gratuita.
          </li>
          <li>
            Debes tener 16 años o más para crear una cuenta. Podemos cerrar una cuenta que abuse de la IA o del servicio
            de PDF, por ejemplo con scripts que envían solicitudes en masa.
          </li>
          <li>Una donación es un regalo. No compra ninguna función ni da ningún derecho adicional.</li>
          <li>
            El editor se ofrece tal como está. Intentamos que siga funcionando, pero no podemos prometer que siempre
            esté disponible ni que no tenga errores, así que guarda una copia de seguridad de tus CV. En la medida en
            que la ley lo permita, no somos responsables de las pérdidas que resulten de usar el editor o de confiar en
            una sugerencia de la IA.
          </li>
          <li>
            Estos términos se rigen por las leyes de Argentina. Cualquier derecho del consumidor que te proteja donde
            vives sigue aplicándose.
          </li>
          <li>
            Podemos cambiar estos términos o el editor. Si un cambio es importante, esta página lo dirá y mostrará una
            fecha nueva.
          </li>
        </ul>
        <p>
          <Link href="/privacy">Privacidad</Link> explica qué guarda el editor y dónde. Si tienes preguntas sobre estos
          términos, escribe a <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>.
        </p>
      </>
    ),
  },
};

export default es;
