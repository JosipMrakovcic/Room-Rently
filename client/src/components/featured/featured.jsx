import "./featured.css";
const Featured= ()=>{
    return(
        <div className="featured">
            <div className="featureditem">
                <img src="/among us.png "alt="Featured" />
                <div className="featuredtitles">
                    <h1>amongus NOOB</h1>
                    <h2>123 propeties</h2>
                </div>
            </div>

            <div className="featureditem">
                <img src="/image.png "alt="Featured" />
                <div className="featuredtitles">
                    <h1>amongus PRO</h1>
                    <h2>123 propeties</h2>
                </div>
            </div>

            <div className="featureditem">
                <img src="/amogus1.png "alt="Featured" />
                <div className="featuredtitles">
                    <h1>amongus HACKER</h1>
                    <h2>123 propeties</h2>
                </div>
            </div>
        </div>
    )
}
export default Featured