// src/lib/todos/ccat/descarga/dwmd.js
// Exportador de reporte CCAT en formato Markdown (.md)

export const descargarMdReporte = (results, lang = 'es') => {
  if (!results) return;
  const isEn = lang === 'en';

  let md = '';
  md += `# ${isEn ? 'CCAT PRACTICE TEST REPORT' : 'REPORTE DE SIMULADOR CCAT'}\n\n`;
  md += `* ${isEn ? 'Date' : 'Fecha'}: ${new Date().toLocaleString()}\n`;
  md += `* ${isEn ? 'Score' : 'Puntaje'}: **${results.score} / 50** (${isEn ? 'correct' : 'correctas'})\n`;
  md += `* ${isEn ? 'Estimated Percentile' : 'Percentil Estimado'}: **${results.percentile}%**\n\n`;

  md += `## ${isEn ? 'Category Breakdown' : 'Desglose por Categoría'}\n\n`;
  md += `| ${isEn ? 'Category' : 'Categoría'} | ${isEn ? 'Correct Answers' : 'Respuestas Correctas'} | ${isEn ? 'Percentage' : 'Porcentaje'} |\n`;
  md += `| :--- | :---: | :---: |\n`;
  
  const cats = [
    { name: isEn ? 'Verbal Reasoning' : 'Razonamiento Verbal', key: 'verbal' },
    { name: isEn ? 'Numerical Reasoning' : 'Razonamiento Numérico', key: 'numerical' },
    { name: isEn ? 'Spatial Reasoning' : 'Razonamiento Espacial', key: 'spatial' }
  ];

  cats.forEach(c => {
    const stats = results.categories[c.key] || { correct: 0, total: 0 };
    const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    md += `| ${c.name} | ${stats.correct} / ${stats.total} | ${pct}% |\n`;
  });
  
  md += `\n## ${isEn ? 'Question-by-Question Review' : 'Revisión Pregunta por Pregunta'}\n\n`;

  results.answers.forEach((ans, idx) => {
    const statusSymbol = ans.isCorrect ? '✅' : ans.isSkipped ? '⚪' : '❌';
    const statusText = ans.isCorrect 
      ? (isEn ? 'Correct' : 'Correcto') 
      : ans.isSkipped 
        ? (isEn ? 'Skipped' : 'Omitido') 
        : (isEn ? 'Incorrect' : 'Incorrecto');

    md += `### ${idx + 1}. [${statusSymbol} ${statusText}] ${ans.questionText}\n\n`;
    
    ans.options.forEach((opt, optIdx) => {
      const letter = String.fromCharCode(65 + optIdx);
      let mark = '';
      if (optIdx === ans.correctAnswerIndex) {
        mark = ` (${isEn ? 'Correct Answer' : 'Respuesta Correcta'})`;
      }
      if (optIdx === ans.userAnswerIndex && optIdx !== ans.correctAnswerIndex) {
        mark = ` (${isEn ? 'Your Choice' : 'Tu Respuesta'})`;
      }
      md += `* **${letter}.** ${opt}${mark}\n`;
    });

    md += `\n**${isEn ? 'Explanation' : 'Explicación'}:** ${ans.explanation}\n\n`;
    md += `---\n\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `ccat_simulador_reporte_${new Date().toISOString().slice(0, 10)}.md`;
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
