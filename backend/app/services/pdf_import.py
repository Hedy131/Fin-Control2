import base64
from typing import List

import anthropic

from app.core.config import settings
from app.schemas.import_pdf import ExtractedStatement, ExtractedTransactionRow

MODEL = "claude-sonnet-5"


def _build_prompt(category_names: List[str]) -> str:
    categories_hint = (
        ", ".join(category_names) if category_names else "(nenhuma categoria cadastrada ainda)"
    )
    return (
        "Este PDF e um extrato bancario mensal. Extrai TODAS as linhas de transacao "
        "(depositos, pagamentos, compras, levantamentos, transferencias, etc.).\n\n"
        "Para cada transacao devolve:\n"
        "- date: data no formato ISO yyyy-mm-dd\n"
        "- description: a descricao tal como aparece no extrato\n"
        "- amount: valor sempre positivo (sem sinal)\n"
        "- type: \"income\" se o dinheiro entrou na conta (deposito/credito), "
        "\"expense\" se saiu (pagamento/debito/compra)\n"
        "- suggested_category: o nome mais proximo desta lista de categorias existentes, "
        "se alguma fizer sentido (senao omite o campo): " + categories_hint + "\n\n"
        "NAO incluas linhas de cabecalho, saldo anterior/atual, ou totais/resumos como se "
        "fossem transacoes — só lançamentos individuais reais."
    )


def extract_transactions_from_pdf(pdf_bytes: bytes, category_names: List[str]) -> List[ExtractedTransactionRow]:
    if not settings.ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY nao esta configurada no servidor")

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    encoded = base64.standard_b64encode(pdf_bytes).decode("utf-8")

    try:
        response = client.messages.parse(
            model=MODEL,
            max_tokens=8192,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "document",
                            "source": {
                                "type": "base64",
                                "media_type": "application/pdf",
                                "data": encoded,
                            },
                        },
                        {"type": "text", "text": _build_prompt(category_names)},
                    ],
                }
            ],
            output_format=ExtractedStatement,
        )
    except anthropic.APIError as e:
        raise ValueError(f"Falha ao comunicar com a Claude API: {e}")

    if response.stop_reason == "refusal" or response.parsed_output is None:
        raise ValueError("A IA nao conseguiu processar este PDF (recusado ou sem resultado).")

    return response.parsed_output.transactions
