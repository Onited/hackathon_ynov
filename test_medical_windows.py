import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

print("🩺 Lancement de l'évaluation du modèle médical TechCorp (Version Windows/Linux)...")

model_id = "microsoft/Phi-3.5-mini-instruct"
adapter_dir = "adapters" # Le dossier contenant votre fine-tuning

print("Chargement du tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(model_id)

print("Chargement du modèle de base Microsoft...")
# Chargement du modèle de base
base_model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.float16,
    device_map="auto" # Va utiliser la carte graphique Nvidia automatiquement si disponible
)

print("Injection de votre 'cerveau' médical (LoRA)...")
model = PeftModel.from_pretrained(base_model, adapter_dir)

print("\n" + "="*50)
user_prompt = input("Posez votre question médicale : ")
print("="*50 + "\n")

prompt = f"<|user|>\n{user_prompt}<|end|>\n<|assistant|>\n"
inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

print("Réflexion de l'IA en cours...\n")
outputs = model.generate(
    **inputs,
    max_new_tokens=300,
    temperature=0.3
)

response = tokenizer.decode(outputs[0], skip_special_tokens=True)

print("🤖 DIAGNOSTIC IA :")
print(response.split("<|assistant|>")[-1].strip())
