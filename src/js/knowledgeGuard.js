// Authentic Knowledge Guard
// Enforces that content and answers are verified where possible.

(function(){
  const KnowledgeGuard = {
    enforce: true,
    // For SQL, authenticity is established by server-side result comparison
    isSqlAnswerVerified: (result) => {
      return !!(result && result.comparison && result.comparison.matches === true);
    },
    // For theory/MCQ (future modules), require a verified flag or trusted sources
    isTheoryContentVerified: (question) => {
      if (!question) return false;
      if (question.verified === true) return true;
      if (Array.isArray(question.sources) && question.sources.length > 0) return true;
      return false;
    }
  };

  window.KnowledgeGuard = KnowledgeGuard;
})();

