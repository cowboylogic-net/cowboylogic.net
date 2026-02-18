# CowboyLogic API Docs

This documentation covers verified backend API behavior from `server/` code only.

## Index

- [Overview](./overview.md)
- [Route Inventory (Source of Truth)](./routes-inventory.md)
- [Auth](./auth.md)
- [Books, Search, Favorites](./books.md)
- [Cart](./cart.md)
- [Orders](./orders.md)
- [Pages](./pages.md)
- [Contact and Newsletter](./contacts-and-newsletter.md)
- [Square](./square.md)
- [Google Login](./google-login.md)
- [Uploads](./uploads.md)
- [Admin](./admin.md)

## Documentation Rules Used

- Each endpoint is documented only if confirmed in route/controller code.
- Code anchors use `path + identifier`.
- If behavior cannot be confirmed from code, it is marked **Needs verification**.
- Placeholders only: `<BASE_URL>`, `<JWT>`, `<USER_EMAIL>`, `<PASSWORD>`, `<ORDER_ID>`.

## Security Notes

- Never place real secrets in examples.
- Treat potentially exposed secrets as compromised and rotate.
- Square webhook signature behavior is documented in `square.md` with an explicit warning.
