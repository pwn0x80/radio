import styled from 'styled-components';
import { useCallback, useEffect, useRef, useState } from "react";
import { MainWrapper, MainContentOption, MainContentWrapper } from "./ContentBox.styles.jsx"
import { updateCurrentPlaying } from "../../redux/radioSlice"
import { useDispatch, useSelector } from "react-redux";
const ContentBox = () => {
  const [radioTrack, setRadioTrack] = useState([])
  const [offsetState, setoffsetState] = useState(0);
  const genresSelect = useSelector(state => state.radio.audio.genres)

  const baseUrl = useSelector(state => state.radio.audio.baseUrl);
  const currentPlayUrl = useSelector(state => state.radio.audio.currentplayingUrl);
  let dispatch = new useDispatch();
  let observerRef = useRef();
  const callbackRef = useCallback((node => {
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setoffsetState(e => e + 10);
      }
    })
    if (node) observerRef.current.observe(node)
  }), [])
  useEffect(() => {
    setoffsetState(0)
    setRadioTrack([])
  }, [genresSelect])

  useEffect(() => {
    if (genresSelect == null) return

    try {
      (async () => {
        let genresSelectfilter = genresSelect.replace('#', '')
        let limit = 10
        let url = baseUrl + "/json/stations/byname/" + genresSelectfilter + `?limit=${limit}&offset=${offsetState}`
        let data = await fetch(url)
        let radioList = await data.json()
        setRadioTrack(e => [...e, ...radioList]);
      })()
    } catch {
      console.log("sommething went wrong")
    }
  }, [genresSelect, offsetState])
  let trackTrigger = detail => (...ev) => {
    //todo error check 
    dispatch(updateCurrentPlaying(
      {
        coverPic: detail.favicon,
        trackName: detail.name,
        currentplayingUrl: detail.url_resolved,
        uuid: detail.stationuuid,
      }
    ));
  }

  return (
    <MainWrapper>
      <div style={{
        height: '300px', overflowY: 'auto'
      }}>
        <MainContentWrapper>
          {radioTrack.length == 0 ? "loading..." :
            radioTrack.map((e, keys) => {
              if (radioTrack.length - 2 == keys) {
                return (
                  <MainContentOption key={keys} data-id={`${e?.stationsuuid}`} ref={callbackRef} onClick={trackTrigger(e)} >{e?.name}</MainContentOption>
                )
              }
              return (
                <MainContentOption data-id={`${e?.stationuuid}`} key={keys} onClick={trackTrigger(e)} >{e?.name}</MainContentOption>
              )

            })
          }


        </MainContentWrapper>
      </div>

    </MainWrapper>
  )
}

export default ContentBox
