Dijagram prikazuje skup klasa koje čine osnovu sustava za upravljanje smještajem, rezervacijama i pripadajućim podacima o korisnicima i jedinicama smještaja.
Model korisnika predstavljen je klasom Person, koja sadrži osnovne informacije kao što su id, name, email, te boolean polja isAdmin, isUser i isOwner koja definiraju ulogu korisnika unutar sustava.
Za pristup podacima o korisnicima koristi se PersonRepo, dok PersonController omogućuje dodavanje, dohvat i brisanje korisnika.
