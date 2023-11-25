from simple_term_menu import TerminalMenu
import subprocess
import os

def main():
    calling_script_directory = os.path.dirname(os.path.abspath(__file__))
    single_player_path = os.path.join(calling_script_directory, 'snake_single.py')
    multiplayer_path = os.path.join(calling_script_directory, 'multiplayer-snake/snake_multi.py')
    # single_player_path = './snake_single.py'
    # multiplayer_path = './multiplayer-snake/snake_multi.py'
    game_modes= ["Single Player", "Multiplayer", "Slitherio"]
    terminal_menu = TerminalMenu(game_modes, title="Select a game mode")
    menu_entry_index = terminal_menu.show()
    print(f"{game_modes[menu_entry_index]}")
    if (menu_entry_index == 0):
        subprocess.call(['python', single_player_path])
    elif (menu_entry_index == 1):
        subprocess.call(['python', multiplayer_path])


if __name__ == "__main__":
    main()
