// for displaying Artist Name(s)
export function DisplayArtistsName(props) {
    const { names } = props
    let artistName = ''

    for (let index = 0; index < names?.length; index++) {
        const element = names[index];
        artistName += element?.name
        artistName += ", "
    }

    return artistName.slice(0, artistName.length-2)
}