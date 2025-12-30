import { View, Animated, TouchableWithoutFeedback, Modal, Dimensions } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../constants/theme";

const BottomUpModal = ({ isVisible, onClose, children, visibleHeight }) => {

    const modalAnimatedValue = useRef(new Animated.Value(0)).current;
    const [matterSelectModal, setMatterSelectModal] = useState(isVisible);
    const { height } = Dimensions.get("window");

    useEffect(() => {
        if (matterSelectModal) {
            Animated.timing(modalAnimatedValue, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false,
            }).start();
        } else {
            Animated.timing(modalAnimatedValue, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }).start(() => onClose());
        }
    }, [matterSelectModal]);

    const modalY = modalAnimatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [height, height - visibleHeight],
    });

    return (
        <Modal animationType="slide" transparent={true} visible={isVisible}>
            <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.7)", }} >

                {/* Transparent background */}
                <TouchableWithoutFeedback onPress={() => setMatterSelectModal(false)}>
                    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
                </TouchableWithoutFeedback>

                <Animated.View style={{ position: "absolute", top: (height - visibleHeight), width: '100%', height: '100%', borderRadius: 12, backgroundColor: COLORS.gray }}>
                    {children}
                </Animated.View>

            </View>
        </Modal>
    );
};
export default BottomUpModal;