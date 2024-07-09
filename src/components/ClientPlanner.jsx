import { useState, useEffect } from "react";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { Button, ButtonGroup } from "reactstrap";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import { auth, db } from "../../firebase";
import { signOut, onAuthStateChanged, deleteUser } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { ToastContainer, toast } from "react-toastify";
import {
  updateDoc,
  getDoc,
  doc,
  arrayUnion,
  deleteDoc,
} from "firebase/firestore";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import List from "@mui/material/List";
import { v4 as uuidv4 } from "uuid";

export default function ClientPlanner() {
  //services list
  const services = [
    {
      id: 1,
      name: "HAIRCUT",
      price: 40,
      time: 15,
    },
    {
      id: 2,
      name: "COMBO 1 HAIR + BEARD TRIMMING",
      price: 60,
      time: 45,
    },
    {
      id: 3,
      name: "CHILDREN'S HAIRCUT (UP TO 12 YEARS)",
      price: 30,
      time: 15,
    },
    {
      id: 4,
      name: "LONG HAIR CUT",
      price: 70,
      time: 30,
    },
    {
      id: 5,
      name: "BEARD TRIMMING",
      price: 40,
      time: 30,
    },
    {
      id: 6,
      name: "COMBO 1 + BEARD TRIMMING WITH RAZOR",
      price: 80,
      time: 45,
    },
    {
      id: 7,
      name: "GRAY HAIR COVERAGE (HAIR OR BEARD)",
      price: 40,
      time: 45,
    },
    {
      id: 8,
      name: "HEAD SHAVING WITH RAZOR",
      price: 40,
      time: 20,
    },
    {
      id: 9,
      name: "EAR WAXING",
      price: 20,
      time: 10,
    },
    {
      id: 10,
      name: "NOSE WAXING",
      price: 20,
      time: 10,
    },
    {
      id: 11,
      name: "EYEBROW WAXING",
      price: 20,
      time: 10,
    },
    {
      id: 12,
      name: "HAIR STYLING",
      price: 40,
      time: 25,
    },
  ];

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1024 },
      items: 5,
      slidesToSlide: 3, // Przesuwaj o 3 elementy na raz na dużych ekranach
    },
    desktop: {
      breakpoint: { max: 1024, min: 768 },
      items: 3,
      slidesToSlide: 2, // Przesuwaj o 2 elementy na raz na ekranach desktopowych
    },
    tablet: {
      breakpoint: { max: 768, min: 464 },
      items: 2,
      slidesToSlide: 1, // Przesuwaj o 1 element na raz na tabletach
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1, // Przesuwaj o 1 element na raz na telefonach
    },
  };

  const [selected, setSelected] = useState(services[0]);
  const [price, setPrice] = useState(40);
  const [time, setTime] = useState(15);
  const [selectedDate, setSelectedDate] = useState();
  const navigate = useNavigate();
  const [timeSlots, setTimeSlots] = useState([]);
  const [checkedTime, setCheckedTime] = useState();
  const [name, setName] = useState();
  const [surname, setSurname] = useState();
  const [phone, setPhone] = useState();
  const [allReservations, setAllReservations] = useState();
  const [filteredUserReservations, setFilteredUserReservations] = useState();
  const [filteredIntervals, setFilteredIntervals] = useState([]);
  const [isActive, setIsActive] = useState("Booking");
  const [openStates, setOpenStates] = useState({});
  const [isChanged, setIsChanged] = useState(true);
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);

  const errorToast = () =>
    toast.error("Please select the service, date, and time.");
  const errorTimeToast = () => toast.error("Please select a different time.");
  const successToast = () =>
    toast.success("The appointment has been scheduled.");
  //
  const currentDate = new Date();
  const currentHour = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();
  const threeMonthsLater = new Date(currentDate);
  threeMonthsLater.setMonth(currentDate.getMonth() + 3);

  //logout function
  const logout = () => {
    signOut(auth);
  };

  //checking if the user is logged in
  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (user.displayName === "admin") {
        navigate("/admin");
      }
    }

    if (!user) {
      navigate("/");
    }
  });

  const deleteCurrentUser = async () => {
    await deleteDoc(doc(db, "clients", auth.currentUser.uid)).then(async () => {
      await deleteUser(auth.currentUser)
        .then(() => {
          // User deleted.
          navigate("/");
        })
        .catch((error) => {
          // An error ocurred
          console.log(error);
        });
    });
  };

  const handleToggle = (id) => {
    setOpenStates((prevOpenStates) => ({
      ...prevOpenStates,
      [id]: !prevOpenStates[id],
    }));
  };

  const changeSelect = (e) => {
    setPrice(e.price);
    setTime(e.time);
    setSelected(services[e.id - 1]);
  };

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  const handleSelect = (arg) => {
    setSelectedDate(arg.startStr);
  };

  const getUserData = async () => {
    const docRef = doc(db, "clients", auth.currentUser.uid);
    const docSnap = await getDoc(docRef);
    setName(docSnap.data().name);
    setSurname(docSnap.data().surname);
    setPhone(docSnap.data().phone);
  };

  //Get all reservations and filter them for client visit information
  const getAllReservations = async () => {
    const docRef = doc(db, "reservations", "rO6yptJcpbmJnwWDAcHd");
    const docSnap = await getDoc(docRef);
    const filteredReservations = docSnap
      .data()
      .reservations.filter(
        (reservation) => reservation.uid === auth.currentUser.uid
      )
      .sort((a, b) => {
        // Assuming date is in the format 'YYYY-MM-DD' and time is in 'HH:mm'
        const dateA = new Date(`${a.selectedDate}T${a.checkedTime}`);
        const dateB = new Date(`${b.selectedDate}T${b.checkedTime}`);

        return dateA - dateB; // Sort ascending
      });
    setFilteredUserReservations(filteredReservations);
    setAllReservations(docSnap.data().reservations);
  };

  useEffect(() => {
    setTimeout(getUserData, 500);
  }, []);

  useEffect(() => {
    getAllReservations();
  }, [isActive, isChanged]);

  function addMinutesToTime(time, minutesToAdd) {
    // Split the time into hours and minutes
    const [hours, minutes] = time.split(":").map(Number);

    // Create a new Date object with today's date and the given time
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);

    // Add the minutes
    date.setMinutes(date.getMinutes() + minutesToAdd);

    // Extract the new hours and minutes
    const newHours = date.getHours().toString().padStart(2, "0");
    const newMinutes = date.getMinutes().toString().padStart(2, "0");

    // Return the new time in HH:mm format
    return `${newHours}:${newMinutes}`;
  }

  const filteredSelectDate = async () => {
    const array = [];
    const docRef = doc(db, "reservations", "rO6yptJcpbmJnwWDAcHd");
    const docSnap = await getDoc(docRef);
    const filteredDateReservations = docSnap
      .data()
      .reservations.filter(
        (reservation) => reservation.selectedDate === selectedDate
      );
    filteredDateReservations.map((reservation) => {
      array.push({
        start: reservation.checkedTime,
        end: addMinutesToTime(reservation.checkedTime, reservation.time),
      });
    });
    setFilteredIntervals(array);
  };

  useEffect(() => {
    filteredSelectDate();
  }, [selectedDate]);

  function timeToMinutes(time) {
    var parts = time.split(":");
    var hours = parseInt(parts[0], 10);
    var minutes = parseInt(parts[1], 10);
    return hours * 60 + minutes;
  }

  function isTimeGreaterThan(time1, time2) {
    var time1Minutes = timeToMinutes(time1);
    var time2Minutes = timeToMinutes(time2);
    return time1Minutes < time2Minutes;
  }

  function isTimeInInterval(time, interval) {
    const [timeHour, timeMinute] = time.split(":").map(Number);
    const [startHour, startMinute] = interval.start.split(":").map(Number);
    const [endHour, endMinute] = interval.end.split(":").map(Number);

    const timeInMinutes = timeHour * 60 + timeMinute;
    const startInMinutes = startHour * 60 + startMinute;
    const endInMinutes = endHour * 60 + endMinute;

    // Checks if the time is within the interval (excluding the end time)
    return timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;
  }

  function findNextGreaterTime(objectsArray, targetTime) {
    // Konwertuj docelową godzinę na liczby całkowite (minuty od północy)
    const [targetHour, targetMinute] = targetTime.split(":").map(Number);
    const targetTotalMinutes = targetHour * 60 + targetMinute;

    // Zmienna do przechowywania najbliższej większej godziny
    let closestGreaterTime = null;
    let closestGreaterTimeDifference = Infinity;

    // Przeszukaj tablicę obiektów
    for (let obj of objectsArray) {
      const [startHour, startMinute] = obj.start.split(":").map(Number);
      const startTotalMinutes = startHour * 60 + startMinute;

      // Sprawdź, czy startTotalMinutes jest większe niż targetTotalMinutes
      if (startTotalMinutes > targetTotalMinutes) {
        // Oblicz różnicę w minutach
        const differenceInMinutes = startTotalMinutes - targetTotalMinutes;

        // Aktualizuj najbliższą większą godzinę, jeśli znaleziono bliższą
        if (differenceInMinutes < closestGreaterTimeDifference) {
          closestGreaterTimeDifference = differenceInMinutes;
          closestGreaterTime = obj;
        }
      }
    }

    return closestGreaterTime;
  }

  //Generating time slots in a carousel
  useEffect(() => {
    function generateTimeSlots(start, end, interval) {
      const index = currentDate.toISOString().indexOf("T");
      const arr = [];
      const timeToDeleteArr = [];
      for (let hour = start; hour <= end; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
          let formattedHour = String(hour).padStart(2, "0");
          let formattedMinute = String(minute).padStart(2, "0");
          if (selectedDate === currentDate.toISOString().slice(0, index)) {
            let isInIntervalButNotEnd = false;
            for (let interval of filteredIntervals) {
              if (
                isTimeInInterval(
                  `${formattedHour}:${formattedMinute}`,
                  interval
                )
              ) {
                isInIntervalButNotEnd = true;
                break;
              }
            }

            if (
              isTimeGreaterThan(
                `${currentHour}:${currentMinutes}`,
                `${formattedHour}:${formattedMinute}`
              )
            ) {
              if (!isInIntervalButNotEnd) {
                arr.push({
                  key: Math.round(Math.random() * 100),
                  time: `${formattedHour}:${formattedMinute}`,
                });
              } else {
                timeToDeleteArr.push({
                  key: Math.round(Math.random() * 100),
                  time: `${formattedHour}:${formattedMinute}`,
                });
              }
            }
          } else {
            let isInIntervalButNotEnd = false;
            for (let interval of filteredIntervals) {
              if (
                isTimeInInterval(
                  `${formattedHour}:${formattedMinute}`,
                  interval
                )
              ) {
                isInIntervalButNotEnd = true;
                break;
              }
            }
            if (!isInIntervalButNotEnd) {
              arr.push({
                key: Math.round(Math.random() * 100),
                time: `${formattedHour}:${formattedMinute}`,
              });
            } else {
              timeToDeleteArr.push({
                key: Math.round(Math.random() * 100),
                time: `${formattedHour}:${formattedMinute}`,
              });
            }
          }
        }
      }
      setTimeSlots(arr);
    }

    generateTimeSlots(11, 17, 15);
  }, [selectedDate, filteredIntervals]);

  const active = (e) => {
    const fcday = document.querySelectorAll(".fc-day");
    fcday.forEach((day) => day.classList.remove("active"));
    e.dayEl.classList.add("active");
  };

  //Adding a class to the selected time
  useEffect(() => {
    const boxes = document.querySelectorAll(".time-box");
    if (boxes)
      boxes.forEach((box) => {
        if (box.innerHTML === checkedTime) {
          box.classList.add("box-ring");
        } else {
          box.classList.remove("box-ring");
        }
      });
  }, [checkedTime]);

  const Booking = async () => {
    const uniqueId = uuidv4();
    const closingTime = addMinutesToTime(checkedTime, time);
    const closestGreaterObject = findNextGreaterTime(
      filteredIntervals,
      checkedTime
    );
    if (closestGreaterObject && closingTime > closestGreaterObject.start) {
      errorTimeToast();
    } else {
      if (selected.name && price && time && selectedDate && checkedTime) {
        await updateDoc(doc(db, "reservations", "rO6yptJcpbmJnwWDAcHd"), {
          reservations: arrayUnion({
            uid: auth.currentUser.uid,
            selected: selected.name,
            price: price,
            time: time,
            selectedDate: selectedDate,
            checkedTime: checkedTime,
            name: name,
            surname: surname,
            phone: phone,
            id: uniqueId,
          }),
        }).then(() => {
          successToast();
        });
      } else {
        errorToast();
      }
    }
  };

  const CancelBooking = async (id) => {
    const updateArray = allReservations;
    const deleteIndex = updateArray.findIndex(
      (reservation) => reservation.id === id
    );
    updateArray.splice(deleteIndex, 1);

    await updateDoc(doc(db, "reservations", "rO6yptJcpbmJnwWDAcHd"), {
      reservations: updateArray,
    }).then(() => setIsChanged(!isChanged));
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    display: 'flex',
    flexFlow: 'column nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "#f1f1f1",
    border: "2px solid rgb(209 213 219)",
    borderRadius: "4px",
    boxShadow: 24,
    color: "#000",
    p: 4,
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            className='text-center'
            id="modal-modal-title"
            variant="h6"
            component="h2"
          >
            Are you sure you want to delete your account?          
          </Typography>
          <div className="flex row justify-between pt-10 w-5/6">
            <Button className="modal-cancel-button" onClick={handleClose}>Cancel</Button>
            <Button className="modal-delete-button" onClick={deleteCurrentUser}>Delete</Button>
          </div>
        </Box>
      </Modal>
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="flex min-h-full flex-1 flex-row justify-center px-6 py-8 lg:px-8">
        <div className="form-size">
          <div className="flex justify-between row-auto">
            <Button className="logout-button p-2 text-base" onClick={logout}>
              Logout
            </Button>
            <Button
              className="delete-button p-2 text-base"
              onClick={() => setOpen(true)}
            >
              Delete account
            </Button>
          </div>
          <ButtonGroup className="pt-16" id="btn-group">
            <Button
              className={
                isActive === "Booking" ? "active-button" : "normal-button"
              }
              onClick={() => setIsActive("Booking")}
            >
              Booking
            </Button>
            <Button
              className={
                isActive === "Appointments" ? "active-button" : "normal-button"
              }
              onClick={() => setIsActive("Appointments")}
            >
              Appointments
            </Button>
          </ButtonGroup>
          {isActive === "Booking" && (
            <>
              <Listbox value={selected} onChange={(e) => changeSelect(e)}>
                {({ open }) => (
                  <>
                    <Label className="block text-lg font-medium leading-6 text-gray-900 pt-2">
                      Services
                    </Label>
                    <div className="relative mt-2">
                      <ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-brown sm:text-sm sm:leading-6">
                        <span className="flex items-center">
                          <span className="ml-3 block truncate">
                            {selected.name}
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-10 ml-3 flex items-center pr-2">
                            ${selected.price}
                          </span>
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                          <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </ListboxButton>

                      <ListboxOptions className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {services.map((person) => (
                          <ListboxOption
                            key={person.id}
                            className={({ active }) =>
                              classNames(
                                active ? "bg-brown text-white" : "",
                                !active ? "text-gray-900" : "",
                                "relative cursor-default select-none py-2 pl-3 pr-9"
                              )
                            }
                            value={person}
                          >
                            {({ selected }) => (
                              <div className="flex items-center">
                                <span
                                  className={classNames(
                                    selected ? "font-semibold" : "font-normal",
                                    "ml-3 block truncate"
                                  )}
                                >
                                  {person.name}
                                </span>
                                <span
                                  className={classNames(
                                    selected ? "font-semibold" : "font-normal",
                                    "pointer-events-none absolute inset-y-0 right-10 ml-3 flex items-center pr-2"
                                  )}
                                >
                                  ${person.price}
                                </span>
                                {selected && (
                                  <span className="text-white absolute inset-y-0 right-0 flex items-center pr-4">
                                    <CheckIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                )}
                              </div>
                            )}
                          </ListboxOption>
                        ))}
                      </ListboxOptions>
                    </div>
                  </>
                )}
              </Listbox>

              {timeSlots.length > 0 && (
                <Carousel className="carousel pt-2" responsive={responsive}>
                  {timeSlots.map((slot) => (
                    <div
                      className="time-box"
                      key={slot.key}
                      onClick={(e) => setCheckedTime(e.target.innerHTML)}
                    >
                      {slot.time}
                    </div>
                  ))}
                </Carousel>
              )}

              <div className="flex flex-row justify-between pr-2 pt-2">
                <p className="block text-lg font-medium leading-6 text-gray-900">
                  Selected date:
                </p>
                <p>
                  {checkedTime} {selectedDate}
                </p>
              </div>

              <div className="flex flex-row justify-between pr-2 pt-6">
                <p className="block text-lg font-medium leading-6 text-gray-900">
                  Service duration:
                </p>
                <p>{time} min</p>
              </div>

              <div className="flex flex-row justify-between pr-2 pt-6">
                <p className="block text-lg font-medium leading-6 text-gray-900">
                  Total:
                </p>
                <p>${price}</p>
              </div>

              <div className="flex flex-row justify-between pr-2 pt-8">
                <Button
                  onClick={Booking}
                  className="booking-button p-2 text-base"
                >
                  Booking
                </Button>
              </div>
            </>
          )}

          {isActive === "Appointments" && (
            <>
              {filteredUserReservations &&
                filteredUserReservations.map((reservation) => (
                  <div key={reservation.id} className="pt-2 text-lg">
                    <div
                      style={{
                        display: "flex",
                        width: "100%",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        flexFlow: "row nowrap",
                      }}
                    >
                      <p style={{ marginBottom: 0, margin: "5px" }}>
                        {reservation.checkedTime} {reservation.selectedDate}
                      </p>
                      {openStates[`ID${reservation.id}`] ? (
                        <ExpandLess
                          onClick={() => handleToggle(`ID${reservation.id}`)}
                        />
                      ) : (
                        <ExpandMore
                          onClick={() => handleToggle(`ID${reservation.id}`)}
                        />
                      )}
                    </div>
                    {/* Adjust as per your requirements */}
                    <Collapse
                      in={openStates[`ID${reservation.id}`]}
                      timeout="auto"
                      unmountOnExit
                    >
                      <List component="div" disablePadding>
                        <ListItemText
                          style={{ marginLeft: "1rem" }}
                          primary={
                            <span className="listItem">
                              <strong>Service: </strong>
                              {reservation.selected}
                            </span>
                          }
                        />
                        <ListItemText
                          style={{ marginLeft: "1rem" }}
                          primary={
                            <span className="listItem">
                              <strong>Duration: </strong>
                              {reservation.time} min
                            </span>
                          }
                        />
                        <ListItemText
                          style={{ marginLeft: "1rem" }}
                          primary={
                            <span className="listItem">
                              <strong>Price: </strong>${reservation.price}
                            </span>
                          }
                        />
                        <Button
                          className="cancel-button"
                          onClick={() => CancelBooking(reservation.id)}
                        >
                          Cancel
                        </Button>
                      </List>
                    </Collapse>
                  </div>
                ))}
            </>
          )}
        </div>

        <div className="planer-size">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            height="83vh"
            aspectRatio={0}
            initialView="dayGridMonth"
            selectable={true}
            select={handleSelect}
            firstDay={1}
            dateClick={(e) => active(e)}
            validRange={{
              start: currentDate.toISOString().split("T")[0],
              end: threeMonthsLater.toISOString().split("T")[0],
            }}
          />
        </div>
      </div>
    </>
  );
}
