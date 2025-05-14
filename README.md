# Projekt README

## Grundlegende Funktionen der Dateien und Programme

### `/config`

* **`passport-config.js`**: Konfiguriert Authentifizierungsstrategien für Passport.js.
    * Implementiert eine lokale Strategie für die Anmeldung mit E-Mail und Passwort.
    * Implementiert eine Microsoft OAuth 2.0-Strategie für die Anmeldung mit Microsoft-Konten.
    * Beinhaltet `serializeUser` und `deserializeUser` Funktionen zur Verwaltung von Benutzersitzungen.
* **`keys-example.js`**: Eine Beispieldatei für Umgebungsvariablen. Diese sollte in `.env` umbenannt und mit den tatsächlichen Werten (z.B. Datenbank-URI, Session Secret, E-Mail-Anmeldeinformationen, Microsoft OAuth-Anmeldeinformationen) gefüllt werden.

### `/controllers`

* **`authController.js`**: Steuert die Logik für Authentifizierungsprozesse.
    * Zeigt Registrierungs- und Anmeldeseiten an.
    * Verarbeitet Benutzerregistrierungen, einschließlich Validierung und Speicherung neuer Benutzer.
    * Verarbeitet Anmeldeversuche über Passport.
    * Verarbeitet Abmeldeanfragen.
    * Verwaltet den Prozess zum Zurücksetzen vergessener Passwörter, einschließlich Token-Generierung, E-Mail-Versand (über `emailService`) und Passwortaktualisierung.
* **`userController.js`**: Steuert die Logik für authentifizierte Benutzer.
    * Zeigt das Benutzer-Dashboard an.
    * Ermöglicht Benutzern das Ändern ihres Passworts, einschließlich der Überprüfung des aktuellen Passworts.
* **`adminController.js`**: Steuert die Logik für Administratoren.
    * Zeigt das Admin-Dashboard an.
    * Listet alle Benutzer auf und ermöglicht deren Verwaltung.
    * Ermöglicht das Bearbeiten von Benutzerdetails (Benutzername, E-Mail, Rolle, Verifizierungsstatus, Passwort) durch einen Administrator.
    * Ermöglicht das Löschen von Benutzern durch einen Administrator.

### `/middlewares`

* **`authMiddleware.js`**: Enthält Middleware-Funktionen zur Zugriffskontrolle.
    * `ensureAuthenticated`: Stellt sicher, dass ein Benutzer angemeldet ist, bevor er auf eine Route zugreifen kann.
    * `ensureAdmin`: Stellt sicher, dass ein Benutzer angemeldet ist UND die Rolle 'admin' hat.
    * `forwardAuthenticated`: Leitet bereits authentifizierte Benutzer von Seiten wie Login oder Registrierung weg.
* **`validationMiddleware.js`**: Definiert Validierungsregeln für Formulareingaben mit `express-validator`.
    * Bietet Regeln für Registrierung (`registrationRules`), Anmeldung (`loginRules`), Passwort vergessen (`forgotPasswordRules`), Passwort zurücksetzen (`resetPasswordRules`) und Passwort ändern (`changePasswordRules`).

### `/models`

* **`User.js`**: Definiert das Mongoose-Schema für Benutzer.
    * Felder: `username`, `email`, `password`, `role` ('user' oder 'admin'), `isVerified`, `createdAt`, `updatedAt`.
    * Ein `pre-save`-Hook hasht automatisch Passwörter vor dem Speichern.
    * Eine Methode `comparePassword` zum Vergleichen von Passwörtern während des Anmeldevorgangs.
* **`PasswordResetToken.js`**: Definiert das Mongoose-Schema für Tokens zum Zurücksetzen von Passwörtern.
    * Felder: `userId` (Referenz zum Benutzer), `token` (eindeutiger UUID), `expiresAt` (Ablaufdatum des Tokens).
    * Ein TTL-Index sorgt für die automatische Löschung abgelaufener Tokens aus der Datenbank.

### `/public`

Enthält statische Assets wie CSS-Dateien und clientseitiges JavaScript.

* **/css/`style.css`**: Die Haupt-Stylesheet-Datei für das grundlegende Aussehen der Anwendung.
    * Definiert Stile für grundlegende HTML-Elemente (`body`, `header`, `footer`, `nav`).
    * Stile für Layout-Container (`.container`, `.main-content`).
    * Styling für Formularelemente (`.form-group`, `input[type="text"]`, `input[type="email"]`, `input[type="password"]`, `select`, `.btn`, `.btn-danger`).
    * Styling für Benachrichtigungen/Alerts (`.alert`, `.alert-success`, `.alert-danger`, `.alert-error`, `.alert-warning`).
    * Styling für Tabellen.
* **/js/`main.js`**: Optionale Datei für clientseitige JavaScript-Logik oder -Verbesserungen. Der bereitgestellte Code enthält auskommentierte Beispiele, z.B. für eine Bestätigungsaufforderung vor dem Löschen von Elementen.

### `/routes`

* **`authRoutes.js`**: Definiert Routen für Authentifizierungsaktionen. Alle Anfragen werden an die entsprechenden Methoden im `authController` weitergeleitet und verwenden bei Bedarf Middleware aus `authMiddleware` und `validationMiddleware`.
    * `GET /register`: Zeigt die Registrierungsseite an.
    * `POST /register`: Verarbeitet die Registrierung.
    * `GET /login`: Zeigt die Anmeldeseite an.
    * `POST /login`: Verarbeitet die Anmeldung.
    * `GET /logout`: Verarbeitet die Abmeldung.
    * `GET /forgot-password`: Zeigt die Seite zum Anfordern eines Passwort-Resets an.
    * `POST /forgot-password`: Verarbeitet die Anforderung eines Passwort-Resets.
    * `GET /reset-password/:token`: Zeigt die Seite zum Zurücksetzen des Passworts an.
    * `POST /reset-password/:token`: Verarbeitet das Zurücksetzen des Passworts.
* **`userRoutes.js`**: Definiert Routen für den Benutzerbereich. Leitet Anfragen an den `userController` und verwendet `ensureAuthenticated` und Validierungsregeln.
    * `GET /dashboard`: Zeigt das Benutzer-Dashboard an.
    * `GET /change-password`: Zeigt die Seite zum Ändern des Passworts an.
    * `POST /change-password`: Verarbeitet die Passwortänderung.
* **`adminRoutes.js`**: Definiert Routen für den Admin-Bereich. Leitet Anfragen an den `adminController` und verwendet `ensureAuthenticated` und `ensureAdmin` Middleware.
    * `GET /dashboard`: Zeigt das Admin-Dashboard an.
    * `GET /users`: Zeigt die Benutzerverwaltungsseite an.
    * `GET /users/:id/edit`: Zeigt die Seite zum Bearbeiten eines Benutzers an.
    * `POST /users/:id/edit`: Verarbeitet die Aktualisierung eines Benutzers.
    * `POST /users/:id/delete`: Verarbeitet das Löschen eines Benutzers.
* **`indexRoutes.js`**: Definiert Routen für die Startseite und allgemeine, nicht spezifisch authentifizierte Bereiche.
    * `GET /`: Zeigt die Willkommensseite an (rendert `index.ejs`).
    * `GET /dashboard`: Leitet authentifizierte Benutzer basierend auf ihrer Rolle entweder zum Admin-Dashboard (`/admin/dashboard`) oder zum Benutzer-Dashboard (`/user/dashboard`) weiter.

### `/services`

* **`emailService.js`**: Enthält Funktionen zum Senden von E-Mails über die Microsoft Graph API.
    * Benötigt Umgebungsvariablen: `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID`, `EMAIL_SENDER_ADDRESS` und optional `APP_NAME` für den E-Mail-Inhalt sowie `HTTPS_PROXY` bei Bedarf.
    * `getGraphAccessToken()`: Ruft ein Zugriffstoken für die Microsoft Graph API mittels Client Credentials Flow (`msal-node`) ab. Verwendet den Scope `https://graph.microsoft.com/.default`.
    * `getAuthenticatedClient()`: Initialisiert einen Microsoft Graph Client (`@microsoft/microsoft-graph-client`) mit dem abgerufenen Zugriffstoken und optionaler Proxy-Konfiguration (`https-proxy-agent`).
    * `sendPasswordResetEmail(toEmail, resetLink)`: Sendet eine Passwort-Reset-E-Mail.
        * Konstruiert den E-Mail-Inhalt (Betreff, HTML-Body) mit dem `resetLink` und `APP_NAME`.
        * Verwendet die `/users/{emailSenderAddress}/sendMail` API-Route von Microsoft Graph, um die E-Mail zu versenden.
        * Die E-Mail wird vom `EMAIL_SENDER_ADDRESS` gesendet.
        * Gibt `true` bei Erfolg und `false` bei Fehlern zurück, mit detaillierter Fehlerprotokollierung in der Konsole, einschließlich Fehlercode und -nachricht von der Graph-API, falls verfügbar.
        * Prüft vor dem Senden, ob die notwendigen Umgebungsvariablen gesetzt sind.

### `/views`

Enthält EJS-Templates für die Benutzeroberfläche, unterteilt in verschiedene Bereiche (`auth`, `user`, `admin`) und Partials für wiederverwendbare UI-Komponenten.

* `/auth`: Templates für Authentifizierungsseiten.
* `/user`: Templates für den Benutzerbereich.
* `/admin`: Templates für den Admin-Bereich.
* `/partials`: Wiederverwendbare Template-Teile (Header, Footer, Navigation, Nachrichtenanzeige).
* `index.ejs`: Template für die Haupt- oder Startseite.
* `404.ejs`: (Annahme) Template für die "Seite nicht gefunden"-Fehlerseite.
* `error.ejs`: (Annahme) Template für die Anzeige allgemeiner Fehler.

### Root-Verzeichnis

* **`.gitignore`**: Listet Dateien und Verzeichnisse auf, die von der Versionskontrolle (Git) ignoriert werden sollen (z.B. `node_modules`, `.env`).
* **`app.js`**: Die Hauptdatei der Anwendung.
    * Initialisiert die Express-Anwendung.
    * Stellt eine Verbindung zur MongoDB-Datenbank her.
    * Konfiguriert und verwendet verschiedene Middleware-Pakete:
        * `dotenv` zum Laden von Umgebungsvariablen.
        * `express.urlencoded` und `express.json` zum Parsen von Anfragekörpern.
        * `express-session` und `connect-mongo` für Sitzungsmanagement mit MongoDB als Speicher.
        * `passport` für die Authentifizierung.
        * `connect-flash` für Flash-Nachrichten.
        * `csurf` für CSRF-Schutz.
        * `express.static` zum Bereitstellen statischer Dateien aus dem `public`-Ordner.
    * Definiert globale Variablen für Views (z.B. `currentUser`, `csrfToken`, Flash-Nachrichten).
    * Bindet die Routen aus dem `/routes`-Verzeichnis ein (`indexRoutes`, `authRoutes`, `userRoutes`, `adminRoutes`).
    * Implementiert eine Funktion `createFirstAdminUser`, um optional einen ersten Administrator-Account beim Start zu erstellen, falls in den Umgebungsvariablen definiert und noch kein Admin existiert.
    * Enthält Fehlerbehandlungs-Middleware für CSRF-Fehler, 404-Fehler (Seite nicht gefunden) und allgemeine Serverfehler.
    * Startet den Server auf dem konfigurierten Port.
* **`package.json`**: [PLATZHALTER - Enthält Metadaten des Projekts wie Name, Version, Skripte (z.B. zum Starten der Anwendung) und listet alle Projektabhängigkeiten (z.B. `express`, `mongoose`, `passport`, `@azure/msal-node`, `@microsoft/microsoft-graph-client`, `isomorphic-fetch`, `https-proxy-agent`) und Entwicklungsabhängigkeiten auf.]

## Setup und Start

1.  **Abhängigkeiten installieren:**
    ```bash
    npm install
    ```
2.  **Umgebungsvariablen konfigurieren:**
    * Kopieren Sie `config/keys-example.js` oder erstellen Sie eine `.env`-Datei im Stammverzeichnis.
    * Füllen Sie die erforderlichen Variablen aus:
        * `MONGO_URI`: Verbindungszeichenfolge für Ihre MongoDB-Datenbank.
        * `SESSION_SECRET`: Ein geheimer Schlüssel für die Sitzungsverschlüsselung.
        * `PORT`: Der Port, auf dem die Anwendung laufen soll (Standard: 3000).
        * `APP_BASE_URL`: Die Basis-URL Ihrer Anwendung (z.B. `http://localhost:3000`), wichtig für OAuth-Callbacks und E-Mail-Links.
        * `APP_NAME`: (Optional) Name Ihrer Anwendung, der in E-Mails verwendet wird (Standard: 'Application').
        * (Optional für ersten Admin) `FIRST_ADMIN_EMAIL` und `FIRST_ADMIN_PASSWORD`.
        * (Für Microsoft OAuth & E-Mail-Dienst) `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID`, `EMAIL_SENDER_ADDRESS`.
        * (Optional bei Proxy-Nutzung für MS Graph) `HTTPS_PROXY`.
3.  **Anwendung starten:**
    ```bash
    npm start
    ```
    (Oder das in `package.json` definierte Startskript)

## Fehlende Dateien / Platzhalter-Informationen

Die folgenden Dateien wurden in der Struktur erwähnt, aber ihr genauer Inhalt und ihre detaillierte Funktionsweise sind ohne den Quellcode nicht vollständig bekannt oder wurden als Platzhalter markiert. Ihre Funktionen sind Annahmen basierend auf gängigen Praktiken oder den bereitgestellten Informationen:

* `config/keys-example.js` (Inhalt ist Platzhalter und dient als Vorlage für `.env`)
* `public/js/main.js` (Der bereitgestellte Code enthält nur auskommentierte Beispiele)
* `views/*/*.ejs` (Die Struktur ist bekannt, aber der genaue Inhalt der EJS-Templates ist Platzhalter)
* `.gitignore` (Der spezifische Inhalt ist Platzhalter)
* `package.json` (Spezifische Skripte und Abhängigkeitsversionen sind Platzhalter)

Diese Platzhalter sollten mit spezifischen Details gefüllt werden, sobald der Code für diese Dateien verfügbar ist oder finalisiert wird.

## Analyse des Microsoft Graph API E-Mail-Versands (`emailService.js`)

Der `emailService.js` verwendet die Microsoft Graph API zum Senden von E-Mails. Hier sind potenzielle Fehlerquellen und Überlegungen:

1.  **Fehlende oder falsche Umgebungsvariablen**:
    * Die Funktion prüft explizit auf `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID` und `EMAIL_SENDER_ADDRESS`. Wenn eine dieser Variablen fehlt, wird der E-Mail-Versand deaktiviert und eine Fehlermeldung in der Konsole ausgegeben.
    * Auch wenn vorhanden, müssen diese Werte korrekt konfiguriert sein (z.B. gültige App-Registrierung in Azure AD, korrekte Tenant ID, etc.).

2.  **Token-Erwerb (`getGraphAccessToken`)**:
    * **Falsche Client Credentials**: Wenn `clientId` oder `clientSecret` falsch sind, schlägt die Authentifizierung bei Microsoft fehl.
    * **Berechtigungen (Scopes)**: Der Code verwendet `['https://graph.microsoft.com/.default']`. Dies ist korrekt für den Client Credentials Flow. Die in Azure AD für die App-Registrierung konfigurierten Anwendungsberechtigungen müssen mindestens `Mail.Send` umfassen, damit die Anwendung E-Mails im Namen des `EMAIL_SENDER_ADDRESS` (oder als Anwendung selbst, abhängig von der genauen Konfiguration und den Berechtigungen) senden darf. Fehlen diese Berechtigungen, wird der API-Aufruf zum Senden der E-Mail fehlschlagen.
    * **Netzwerkprobleme**: Verbindungsprobleme zum Microsoft Identity Platform Endpoint (`https://login.microsoftonline.com/...`).
    * **Drosselung (Throttling)**: Bei zu vielen Anfragen an die Token-Endpunkte.

3.  **Graph API-Client Initialisierung (`getAuthenticatedClient`)**:
    * **Proxy-Konfiguration**: Wenn ein Proxy erforderlich ist (`HTTPS_PROXY` Umgebungsvariable), dieser aber falsch konfiguriert ist, können keine Verbindungen zur Graph API hergestellt werden. `https-proxy-agent` wird hierfür verwendet.

4.  **E-Mail-Versand (`sendPasswordResetEmail`)**:
    * **Ungültige `EMAIL_SENDER_ADDRESS`**: Die `EMAIL_SENDER_ADDRESS` muss eine gültige E-Mail-Adresse sein, die mit dem konfigurierten Azure AD-Mandanten und den Berechtigungen der Anwendung verknüpft ist. Der API-Aufruf `/users/${emailSenderAddress}/sendMail` impliziert, dass die Anwendung die Berechtigung hat, E-Mails *von diesem spezifischen Postfach* zu senden.
        * **Fehlerfall**: Wenn das Konto nicht existiert, keine Lizenz hat oder die App keine Berechtigung für dieses Postfach hat, schlägt der Aufruf fehl. Typische Fehlercodes könnten `ErrorItemNotFound`, `ErrorAccessDenied` oder senderspezifische Fehler sein.
    * **Ungültige `toEmail`**: Die Empfänger-E-Mail-Adresse muss gültig sein.
    * **Graph API-Fehler**:
        * **`ErrorAccessDenied`**: Die Anwendung hat nicht die erforderlichen `Mail.Send` Berechtigungen oder keine Berechtigung für das Postfach des `emailSenderAddress`.
        * **`ErrorMailboxStoreUnavailable` / `ErrorMailSendUnavailable`**: Temporäre Probleme mit dem Exchange Online Dienst.
        * **`ErrorMessageSizeExceeded`**: Die E-Mail ist zu groß (unwahrscheinlich für eine einfache Passwort-Reset-E-Mail).
        * **Drosselung (Throttling)**: Zu viele E-Mails in kurzer Zeit gesendet. Die Graph API hat Limits.
        * **Allgemeine Fehler**: Andere `4xx` oder `5xx` HTTP-Statuscodes von der Graph API.
    * **Fehlerbehandlung**: Der Code enthält einen `try...catch`-Block, der versucht, Details aus dem Fehlerkörper der Graph API zu parsen und zu protokollieren (`errorBody.error?.code`, `errorBody.error?.message`). Dies ist hilfreich für die Diagnose.

5.  **Abhängigkeiten**:
    * `@azure/msal-node`, `@microsoft/microsoft-graph-client`, `isomorphic-fetch` und ggf. `https-proxy-agent` müssen korrekt installiert sein.

**Zusammenfassend für den E-Mail-Versand:** Die häufigsten Probleme sind typischerweise falsche Konfiguration der Azure App-Registrierung (Credentials, API-Berechtigungen – insbesondere `Mail.Send` als Anwendungsberechtigung), falsche Umgebungsvariablen oder Netzwerkprobleme (einschließlich Proxy). Die Fehlerprotokollierung im Code sollte bei der Diagnose helfen.
