# dictation_cli.py

import speech_recognition as sr

def list_devices():
    print("Verfügbare Mikrofon-Quellen:")
    for index, name in enumerate(sr.Microphone.list_microphone_names()):
        print(f"{index}: {name}")

def transcribe(duration: int) -> str:
    recognizer = sr.Recognizer()
    list_devices()
    device_index = int(input("Wähle die Geräte-Nummer: "))

    with sr.Microphone(device_index=device_index) as source:
        print("Aufnahme startet…")
        audio = recognizer.listen(source, phrase_time_limit=duration)

    try:
        text = recognizer.recognize_google(audio, language="de-DE")
        return text
    except sr.UnknownValueError:
        return "[Unverständlich]"
    except sr.RequestError as e:
        return f"[Fehler bei der Anfrage: {e}]"

if __name__ == "__main__":
    dauer = int(input("Dauer der Aufnahme in Sekunden: "))
    ergebnis = transcribe(dauer)
    print("Transkript:")
    print(ergebnis)
