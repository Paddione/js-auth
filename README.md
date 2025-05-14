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
    * Bietet Regeln für Registrierung, Anmeldung, Passwort vergessen, Passwort zurücksetzen und Passwort ändern.

### `/models`
* **`User.js`**: Definiert das Mongoose-Schema für Benutzer.
    * Felder: `username`, `email`, `password`, `role` ('user' oder 'admin'), `isVerified`, `createdAt`, `updatedAt`.
    * Ein `pre-save`-Hook hasht automatisch Passwörter vor dem Speichern.
    * Eine Methode `comparePassword` zum Vergleichen von Passwörtern während des Anmeldevorgangs.
* **`PasswordResetToken.js`**: Definiert das Mongoose-Schema für Tokens zum Zurücksetzen von Passwörtern.
    * Felder: `userId` (Referenz zum Benutzer), `token` (eindeutiger UUID), `expiresAt` (Ablaufdatum des Tokens).
    * Ein TTL-Index sorgt für die automatische Löschung abgelaufener Tokens aus der Datenbank.

### `/public`
* Enthält statische Assets wie CSS-Dateien und clientseitiges JavaScript.
    * **`/css/style.css`**: Vermutlich die Haupt-Stylesheet-Datei für das Aussehen der Anwendung.
    * **`/js/main.js`**: Optionale Datei für clientseitige JavaScript-Logik oder -Verbesserungen.

### `/routes`
* **`authRoutes.js`**: [PLATZHALTER - Definiert Routen für Authentifizierungsaktionen wie `/register`, `/login`, `/logout`, `/forgot-password`, `/reset-password` und leitet Anfragen an die entsprechenden Methoden im `authController` weiter.]
* **`userRoutes.js`**: [PLATZHALTER - Definiert Routen für den Benutzerbereich, z.B. `/dashboard`, `/change-password`, und stellt sicher, dass nur authentifizierte Benutzer darauf zugreifen können, indem es die `authMiddleware` verwendet. Leitet Anfragen an den `userController`.]
* **`adminRoutes.js`**: [PLATZHALTER - Definiert Routen für den Admin-Bereich, z.B. `/users`, `/users/:id/edit`, `/users/:id/delete`, und stellt sicher, dass nur Administratoren darauf zugreifen können, indem es die `authMiddleware` verwendet. Leitet Anfragen an den `adminController`.]
* **`indexRoutes.js`**: [PLATZHALTER - Definiert Routen für die Startseite und andere allgemeine Seiten, die keine spezielle Authentifizierung oder Autorisierung erfordern.]

### `/services`
* **`emailService.js`**: [PLATZHALTER - Enthält Funktionen zum Senden von E-Mails. Wird wahrscheinlich für das Senden von Passwort-Reset-Links und möglicherweise für E-Mail-Verifizierungen verwendet. Benötigt Konfiguration für einen E-Mail-Transportdienst (z.B. SendGrid, Nodemailer mit SMTP).]

### `/views`
* Enthält EJS-Templates für die Benutzeroberfläche, unterteilt in verschiedene Bereiche (auth, user, admin) und Partials für wiederverwendbare UI-Komponenten.
    * **`/auth`**: Templates für Authentifizierungsseiten.
    * **`/user`**: Templates für den Benutzerbereich.
    * **`/admin`**: Templates für den Admin-Bereich.
    * **`/partials`**: Wiederverwendbare Template-Teile (Header, Footer, Navigation, Nachrichtenanzeige).
    * **`index.ejs`**: Template für die Haupt- oder Startseite.
    * **`404.ejs`**: (Annahme) Template für die "Seite nicht gefunden"-Fehlerseite.
    * **`error.ejs`**: (Annahme) Template für die Anzeige allgemeiner Fehler.

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
    * Bindet die Routen aus dem `/routes`-Verzeichnis ein.
    * Implementiert eine Funktion `createFirstAdminUser`, um optional einen ersten Administrator-Account beim Start zu erstellen, falls in den Umgebungsvariablen definiert und noch kein Admin existiert.
    * Enthält Fehlerbehandlungs-Middleware für CSRF-Fehler, 404-Fehler (Seite nicht gefunden) und allgemeine Serverfehler.
    * Startet den Server auf dem konfigurierten Port.
* **`package.json`**: [PLATZHALTER - Enthält Metadaten des Projekts wie Name, Version, Skripte (z.B. zum Starten der Anwendung) und listet alle Projektabhängigkeiten (z.B. express, mongoose, passport) und Entwicklungsabhängigkeiten auf.]

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
        * (Optional für ersten Admin) `FIRST_ADMIN_EMAIL` und `FIRST_ADMIN_PASSWORD`.
        * (Optional für Microsoft OAuth) `MICROSOFT_CLIENT_ID` und `MICROSOFT_CLIENT_SECRET`.
        * (Optional für E-Mail-Dienst) Anmeldeinformationen und Konfiguration für Ihren E-Mail-Provider.
3.  **Anwendung starten:**
    ```bash
    npm start
    ```
    (Oder das in `package.json` definierte Startskript)

## Fehlende Dateien / Platzhalter-Informationen

Die folgenden Dateien wurden in der Struktur erwähnt, aber ihr genauer Inhalt und ihre detaillierte Funktionsweise sind ohne den Quellcode nicht bekannt. Ihre Funktionen sind Annahmen basierend auf gängigen Praktiken:

* `config/keys-example.js` (Inhalt ist Platzhalter)
* `public/css/style.css` (Inhalt ist Platzhalter)
* `public/js/main.js` (Inhalt ist Platzhalter)
* `routes/authRoutes.js`
* `routes/userRoutes.js`
* `routes/adminRoutes.js`
* `routes/indexRoutes.js`
* `services/emailService.js`
* `views/*/*.ejs` (Die Struktur ist bekannt, aber der genaue Inhalt der EJS-Templates ist Platzhalter)
* `.gitignore` (Der spezifische Inhalt ist Platzhalter)
* `package.json` (Spezifische Skripte und Abhängigkeitsversionen sind Platzhalter)

Diese Platzhalter sollten mit spezifischen Details gefüllt werden, sobald der Code für diese Dateien verfügbar ist.
