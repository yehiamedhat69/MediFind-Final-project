# GitHub upload steps

Run these commands from the MediFind project root after copying/merging the `database` folder and docs into the project.

```bash
git checkout main
git pull origin main
git checkout -b feature/database-foundation
git status
git add database docs package.json .gitignore
git commit -m "feat: implement database foundation"
git push -u origin feature/database-foundation
```

Then open a Pull Request:

`feature/database-foundation` → `develop`

After review/approval, merge the PR and move the GitHub task to Done.

## Before pushing

- Make sure you are in the correct MediFind repository.
- Do not commit `.env` or real passwords/secrets.
- If the team already has files with the same names, merge carefully instead of overwriting teammates' work.
