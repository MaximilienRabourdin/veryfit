app.get('/api/events', (req, res) => {
    const { date } = req.query;
    const events = [
      { date: "2024-01-01", name: "Nom de l'événement A" },
      { date: "2024-01-02", name: "Nom de l'événement B" },
    ];
    const filteredEvents = events.filter(event => event.date === date);
    res.json(filteredEvents);
  });
  