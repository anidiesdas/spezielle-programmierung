# Supplement Trends – Google Trends Analyse

## 1. Executive Summary

Im Rahmen dieses Projekts wurde die Kategorie "Supplements" anhand von Google Trends Daten für Deutschland analysiert. Untersucht wurden die Begriffe Whey Protein, Vitamin D, Omega 3, Kreatin und Kollagen über einen Zeitraum von 30 Tagen. Die zentralen Erkenntnisse zeigen, dass Vitamin D mit einem Durchschnittswert von 66 das höchste Suchinteresse aufweist, während Kreatin und Kollagen einen steigenden Trend verzeichnen. Um der Anwendung einen echten Mehrwert zu verleihen, wurden zusätzlich ein KI-gestützter Chatbot sowie eine Funktion zur Erstellung eines personalisierten Supplement-Wochenplans implementiert.

---

## 2. Ziele des Projekts

Das Projekt untersucht die Fragestellung, welche Nahrungsergänzungsmittel in Deutschland aktuell an Interesse gewinnen oder verlieren und was Google Trends Daten über das Suchverhalten der Bevölkerung verraten. Dabei wird analysiert, ob Begriffe wie Kreatin und Kollagen tatsächlich an Relevanz gewinnen, während klassische Supplements wie Whey Protein rückläufig sind. Ziel ist es, aus diesen relativen Suchdaten aussagekräftige Kennzahlen zu berechnen und daraus verständliche Interpretationen zu erzeugen.

---

## 3. Anwendung und Nutzung

**How to start – Step by step:**

1. Repository klonen: `git clone https://github.com/anidiesdas/spezielle-programmierung`
2. `.env` Datei im Root erstellen mit `OPENAI_API_KEY=dein-key`
3. Sealed Secrets Controller installieren: `kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/latest/download/controller.yaml`
4. Ingress Controller installieren: `kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml`
5. Deployment starten: `bash deploy.sh` (im Bash)
6. App aufrufen unter: `http://supplement.localhost`

Die Anwendung richtet sich an gesundheitsbewusste Personen, Fitness-Enthusiasten sowie Ernährungsberaterinnen und -berater, die aktuelle Supplement-Trends verfolgen und individuelle Einnahmepläne erstellen möchten.

---

## 4. Datenanalyse und Ergebnisse

Es wurden vier Visualisierungen erstellt: Ein Liniendiagramm zeigt das Suchinteresse im Zeitverlauf, weil es zeitliche Entwicklungen und Peaks besonders gut sichtbar macht. Ein Donut-Chart wurde gewählt, um die Peakwerte aller Begriffe proportional zu vergleichen. So erkennt man auf einen Blick, welcher Begriff das höchste Einzelinteresse hatte. Ein Balkendiagramm eignet sich ideal für ein Ranking nach Durchschnittswert, da es Größenunterschiede klar darstellt. Zwei Tabellen für Top Queries und Rising Queries zeigen den Kontext der Suchanfragen und helfen zu verstehen, wie und in welchem Zusammenhang gesucht wird.

---

## 5. Visualisierung

Die Anwendung enthält vier Visualisierungen: ein Liniendiagramm zeigt das Suchinteresse aller fünf Begriffe im Zeitverlauf und macht Peaks sowie Trends direkt sichtbar. Ein Donut-Chart vergleicht die höchsten Peakwerte der Begriffe. Ein Balkendiagramm zeigt das Ranking nach durchschnittlichem Suchinteresse. Zwei Tabellen listen die Top Queries und Rising Queries je Begriff auf. Da die Aufgabenstellung keine Vorgaben zum Frontend enthielt, wurde Vue.js mit Node.js gewählt. Alle Visualisierungen wurden ohne externe Chart-Bibliotheken mit reinen SVG- und CSS-Elementen selbst implementiert.

---

## 6. Herausforderungen und Learnings

Eine technische Herausforderung war die Übergabe des OpenAI API Keys in Kubernetes. Normales Base64-Encoding führte zu Fehlern, weshalb das Secret direkt per kubectl erstellt wurde. Zudem übernahm Kubernetes beim Deployment zunächst immer das gecachte alte Image statt das neu gebaute, was durch imagePullPolicy: Always gelöst wurde. Obwohl der vorgegebene Beispielcode des Dozenten auf Python basierte, wurde die Implementierung bewusst in Node.js mit Express umgesetzt, da die Aufgabenstellung keine Sprache vorschrieb und Node.js eine gleichwertige und uns vertrautere Lösung darstellte.

---

## 7. Zukunftsvision

Das System könnte durch Echtzeit-Daten aus der Google Trends API erweitert werden, sobald eine stabile Schnittstelle verfügbar ist. Zusätzliche Supplement-Kategorien wären denkbar. Die AI-Komponente könnte mit wissenschaftlichen Studien angereichert werden, um fundiertere Empfehlungen zu geben. Eine Nutzerverwaltung mit Profil-Speicherung würde die Personalisierung langfristig verbessern.

---

## PITCH

Der Pitch wurde auf Google Drive hochgeladen, da das Video die erlaubte Dateigröße von Github überschreitet. Sie können über den folgenden Link auf das Video zugreifen: https://drive.google.com/file/d/1IbviQzZMOVqp5vZydDM03Mf_512bH4LL/view?usp=sharing

Viel Spaß!