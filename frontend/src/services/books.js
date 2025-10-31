export async function searchBooks(query) {
  const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  return (data.docs || []).slice(0, 10).map((book) => ({
    title: book.title,
    author: book.author_name?.[0] || "Unknown Author",
    cover: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null,
    first_publish_year: book.first_publish_year,
    subject: book.subject?.[0] || "",
  }));
}

