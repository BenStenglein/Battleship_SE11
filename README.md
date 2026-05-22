# Battleship_SE11
Repo housing Battleship project implementation and resources
## AI evaluation 
```mermaid
%%{init: { "flowchart": { "curve": "curve" } } }%%
flowchart LR
gen(generate random tile)

gen_check{has the tile been targeted?}

occpancy_check{is there a ship here?}

  

valid_tile_up{is the tile up valid?}
valid_tile_down{is the tile down valid?}
valid_tile_left{is the tile left valid?}
valid_tile_right{is the tile right valid?}


check_tile_up{is the tile up occupied?}
check_tile_down{is the tile down occupied?}
check_tile_left{is the tile left occupied?}
check_tile_right{is the tile right occupied?}
  
  

error{{error state reached}}

gen-->gen_check

gen_check-->|yes|gen

gen_check -->|no|occpancy_check

occpancy_check-->|no|gen

occpancy_check-->|yes|valid_tile_up

subgraph checkcycle 
    subgraph up
        subgraph U_P [process]
            valid_tile_up-->|yes|check_tile_up
            check_tile_up-->|yes|validdown
            validdown{is the tile down valid}
            validdown-->|yes|checkdown
            checkdown{is the tile down occupied}
        end
        subgraph U_E [e]
            U_E1{{init point is somwhere in the vertical center}}
            U_E2{{init point is the bottom of the ship }}
            U_ERR{{logic error reached}}
        end
        validdown-->|no|U_E2
        checkdown-->|yes|U_E1
        checkdown-->|no|U_E2
    end
    valid_tile_up-->|no|valid_tile_left
    check_tile_up-->|no|valid_tile_left
    subgraph left
        subgraph L_P [process]
            valid_tile_left-->|yes|check_tile_left
            check_tile_left-->|yes|validright
            validright{is the tile right valid}
            validright-->|yes|checkright
            checkright{is the tile right occupied}
        end
        subgraph L_E [end]
            L_E1{{init point is somewhere in the horizontal center}}
            L_E2{{init point is at the right of the ship}}
            L_ERR{{logic error reached}}
            
        end
        validright-->|no|L_E2
        checkright-->|yes|L_E1
        checkright-->|no|L_E2
    end
    valid_tile_left-->|no|valid_tile_down
    check_tile_left-->|no|valid_tile_down
    subgraph down
        subgraph D_P [process]
            valid_tile_down-->|yes|check_tile_down
            check_tile_down-->|yes|validup
            validup{is the tile up valid}
            validup-->|yes|checkup
            checkup{is the tile up occupied}
        end
        subgraph D_E [end]
            D_E1{{init point is somwhere in the vertical center}}
            D_E2{{init point is the top of the ship}}
            D_ERR{{logic error reached}}
        end
        validup-->|no|D_E2
        checkup-->|yes|D_E1
        checkup-->|no|D_E2
    end
    valid_tile_down-->|no|valid_tile_right
    check_tile_down-->|no|valid_tile_right
    subgraph right
        subgraph R_P [process]
            valid_tile_right-->|yes|check_tile_right
            check_tile_right-->|yes|validleft
            validleft{is the tile left valid}
            validleft-->|yes|checkleft
            checkleft{is the tile left occupied}
        end
        subgraph R_E [end]
            R_E1{{init point is somwhere in horizontal center}}
            R_E2{{init point is leftmost point}}
            R_ERR{{logic error reached}}
        end
        valid_tile_right-->|no|R_ERR
        check_tile_right-->|no|R_ERR
        validleft-->|no|R_E2
        checkleft-->|yes|R_E1
        checkleft-->|no|R_E2
    end
end
```
