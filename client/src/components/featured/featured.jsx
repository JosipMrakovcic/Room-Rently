import "./featured.css";
const Featured= ()=>{
    return(
        <div className="featured">
            <div className="featureditem">
                <img src="/pogledmore.jpg"alt="Featured" />
                <div className="featuredtitles">
                    <h1>Sea view</h1>
                    <h2>3 available apartments</h2>
                </div>
            </div>

            <div className="featureditem">
                <img src="/poglednalivadu.webp "alt="Featured" />
                <div className="featuredtitles">
                    <h1>Village view</h1>
                    <h2>123 available apartments</h2>
                </div>
            </div>

            <div className="featureditem">
                <img src="/poglednajezero.jpg"alt="Featured" />
                <div className="featuredtitles">
                    <h1>Lake view</h1>
                    <h2>167 available apartments</h2>
                </div>
            </div>
        </div>
    )
}
export default Featured