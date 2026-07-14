// Builds the synthesis prompt used to fuse N independent model answers into one.
// Kept as a plain string template so the fusion call is just one more LLM
// request through the existing callSingleModel() pipeline.

function shortLabel(modelId) {
  // "openai/gpt-4o" -> "gpt-4o", "groq/llama-3.3-70b-versatile" -> "llama-3.3-70b-versatile"
  const parts = String(modelId || '').split('/');
  return parts.length > 1 ? parts.slice(1).join('/') : modelId;
}

function buildFusionPrompt(userQuestion, successes, failures) {
  const candidateBlocks = successes
    .map((s) => `[${shortLabel(s.modelId)}]:\n${s.content}`)
    .join('\n\n');

  const failedBlock = (failures && failures.length)
    ? `\n\n(The following models did not respond in time and are excluded: ${failures.map((f) => shortLabel(f.modelId)).join(', ')})`
    : '';

  return `You are a synthesis engine. Below is one user question and ${successes.length} independent answers from different AI models. Produce ONE final answer that is more accurate, complete, and useful than any single one of them — resolve contradictions in favor of the most well-supported/consistent claim, merge complementary details, drop redundancy, fix any errors you can identify, and match the tone/format the user's question implies.

Do not mention that you are synthesizing multiple models or refer to the models by name (e.g. do not say "Model A" or name any provider) — answer as if you are simply answering the question directly and well.

If the candidate answers disagree substantively on a factual claim, prefer the majority view unless one response shows clearly superior reasoning; if genuinely uncertain, briefly flag the ambiguity in the final answer.

USER QUESTION:
${userQuestion}

CANDIDATE ANSWERS:
${candidateBlocks}${failedBlock}

FINAL ANSWER:`;
}

module.exports = { buildFusionPrompt };
