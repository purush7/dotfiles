# Dotfiles

What is this repo?

- This repo is created to maintain the dotfiles

How to use this repo?


- Create a bare repo by using `git clone git@github.com:purush7/dotfiles.git --single-branch -b <branch> --bare $HOME/.dotfiles` in $HOME
- Set upstream branch for origin to <branch> by `git push -set-upstream origin <branch>`
- Follow below steps
```
alias dotfiles='/usr/bin/git --git-dir=$HOME/.dotfiles/ --work-tree=$HOME'
dotfiles config --local status.showUntrackedFiles no
echo "alias dotfiles='/usr/bin/git --git-dir=$HOME/.dotfiles/ --work-tree=$HOME'" >> $HOME/.shconfig
```
- `dotfiles checkout <last-commit> -f`   (It updates the files in work-dir)
- `dotfiles checkout <branch>`


How to push the changes?

- `dotfiles add <path> && dotfiles commit -m <msg>`
- `dotfiles push origin`
