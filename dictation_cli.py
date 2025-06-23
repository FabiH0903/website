import argparse
from datetime import datetime

try:
    import speech_recognition as sr
except ImportError:
    print("speech_recognition not installed. Install via pip for full functionality.")
    raise

SPEAKER_KEYWORDS = ['ich', 'mir', 'mich']


def classify(text: str) -> str:
    lower = text.lower()
    if any(k in lower for k in SPEAKER_KEYWORDS):
        return 'Patient'
    return 'Arzt'


def transcribe(duration: int) -> str:
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("Aufnahme...")
        audio = recognizer.listen(source, phrase_time_limit=duration)
    try:
        return recognizer.recognize_google(audio, language='de-DE')
    except Exception as e:
        print("Fehler bei der Transkription:", e)
        return ""


def append_record(file_path: str, line: str) -> None:
    with open(file_path, 'a', encoding='utf-8') as f:
        f.write(line + "\n")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Einfache Diktierfunktion')
    parser.add_argument('--seconds', type=int, default=5, help='Aufnahmedauer in Sekunden')
    parser.add_argument('--output', default='transcript.txt', help='Datei für gespeicherte Zeilen')
    args = parser.parse_args()

    text = transcribe(args.seconds)
    if not text:
        exit()
    speaker = classify(text)
    line = f"{speaker}: {text}"
    print(line)
    append_record(args.output, line)
