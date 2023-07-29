// for displaying Artist Name(s)
export function DisplayArtistsName(props) {
    const { names } = props
    let artistName = ''

    for (let index = 0; index < names?.length; index++) {
        const element = names[index];
        if (index === 0) {
            artistName += element?.name
        }
        else { artistName += ", ", artistName += element.name }
    }
    return artistName
}