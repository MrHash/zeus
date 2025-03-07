import * as React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { inject, observer } from 'mobx-react';
import { Button, Header, Icon } from 'react-native-elements';

import InvoicesStore from './../stores/InvoicesStore';
import TransactionsStore from './../stores/TransactionsStore';
import UnitsStore from './../stores/UnitsStore';
import SettingsStore from './../stores/SettingsStore';

interface InvoiceProps {
    exitSetup: any;
    navigation: any;
    InvoicesStore: InvoicesStore;
    TransactionsStore: TransactionsStore;
    UnitsStore: UnitsStore;
    SettingsStore: SettingsStore;
}

interface InvoiceState {
    setCustomAmount: boolean;
    customAmount: string;
}

@inject('InvoicesStore', 'TransactionsStore', 'UnitsStore', 'SettingsStore')
@observer
export default class PaymentRequest extends React.Component<InvoiceProps, InvoiceState> {
    state = {
        setCustomAmount: false,
        customAmount: ''
    }

    render() {
        const { TransactionsStore, InvoicesStore, UnitsStore, SettingsStore, navigation } = this.props;
        const { setCustomAmount, customAmount } = this.state;
        const { pay_req, paymentRequest, getPayReqError, loading } = InvoicesStore;
        const { units, changeUnits, getAmount } = UnitsStore;

        const num_satoshis = pay_req && pay_req.num_satoshis;
        const expiry = pay_req && pay_req.expiry;
        const cltv_expiry = pay_req && pay_req.cltv_expiry;
        const destination = pay_req && pay_req.destination;
        const description = pay_req && pay_req.description;
        const payment_hash = pay_req && pay_req.payment_hash;
        const timestamp = pay_req && pay_req.timestamp;

        const date = new Date(Number(timestamp) * 1000).toString();

        const { settings } = SettingsStore;
        const { theme } = settings;

        const BackButton = () => (
            <Icon
                name="arrow-back"
                onPress={() => navigation.navigate('Send')}
                color="#fff"
                underlayColor="transparent"
            />
        );

        return (
            <View style={theme === 'dark' ? styles.darkThemeStyle : styles.lightThemeStyle}>
                <Header
                    leftComponent={<BackButton />}
                    centerComponent={{ text: 'Lightning Invoice', style: { color: '#fff' } }}
                    backgroundColor={theme === "dark" ? "#261339" : "rgba(92, 99,216, 1)"}
                />

                {loading && <ActivityIndicator size="large" color="#0000ff" />}

                {!!getPayReqError && <View style={styles.content}>
                    <Text style={theme === 'dark' ? styles.labelDark : styles.label}>Error loading invoice</Text>
                </View>}

                {pay_req && <View style={styles.content}>
                    <View style={styles.center}>
                        <TouchableOpacity onPress={() => changeUnits()}>
                            <Text style={theme === 'dark' ? styles.amountDark : styles.amount}>{units && getAmount(num_satoshis || 0)}</Text>
                        </TouchableOpacity>
                    </View>

                    {description && <Text style={theme === 'dark' ? styles.labelDark : styles.label}>Description:</Text>}
                    {description && <Text style={theme === 'dark' ? styles.valueDark : styles.value}>{description}</Text>}

                    {timestamp && <Text style={theme === 'dark' ? styles.labelDark : styles.label}>Timestamp:</Text>}
                    {timestamp && <Text style={theme === 'dark' ? styles.valueDark : styles.value}>{date}</Text>}

                    {expiry && <Text style={theme === 'dark' ? styles.labelDark : styles.label}>Expiry:</Text>}
                    {expiry && <Text style={theme === 'dark' ? styles.valueDark : styles.value}>{expiry}</Text>}

                    {cltv_expiry && <Text style={theme === 'dark' ? styles.labelDark : styles.label}>CLTV Expiry:</Text>}
                    {cltv_expiry && <Text style={theme === 'dark' ? styles.valueDark : styles.value}>{cltv_expiry}</Text>}

                    {destination && <Text style={theme === 'dark' ? styles.labelDark : styles.label}>Destination:</Text>}
                    {destination && <Text style={theme === 'dark' ? styles.valueDark : styles.value}>{destination}</Text>}

                    {payment_hash && <Text style={theme === 'dark' ? styles.labelDark : styles.label}>Payment Hash:</Text>}
                    {payment_hash && <Text style={theme === 'dark' ? styles.valueDark : styles.value}>{payment_hash}</Text>}

                    {setCustomAmount && <Text style={{ color: theme === 'dark' ? 'white' : 'black' }}>Custom Amount (in satoshis)</Text>}
                    {setCustomAmount && <TextInput
                        placeholder={'100'}
                        value={customAmount}
                        onChangeText={(text: string) => this.setState({ customAmount: text })}
                        numberOfLines={1}
                        style={theme === 'dark' ? styles.textInputDark : styles.textInput}
                        placeholderTextColor='gray'
                    />}
                </View>}

                {pay_req && <View style={styles.button}>
                    <Button
                        title={setCustomAmount ? "Pay default amount" : "Pay custom amount"}
                        icon={{
                            name: "edit",
                            size: 25,
                            color: theme === 'dark' ? 'black' : 'white'
                        }}
                        onPress={() => {
                            this.setState({
                                  setCustomAmount: !setCustomAmount
                            });
                        }}
                        style={styles.button}
                        titleStyle={{
                            color: theme === 'dark' ? 'black' : 'white'
                        }}
                        buttonStyle={{
                            backgroundColor: theme === 'dark' ? 'white' : 'black',
                            borderRadius: 30
                        }}
                    />
                </View>}

                {pay_req && <View style={styles.button}>
                    <Button
                      title="Pay this invoice"
                      icon={{
                          name: "send",
                          size: 25,
                          color: "white"
                      }}
                      onPress={() => {
                          if (setCustomAmount && customAmount) {
                              TransactionsStore.sendPayment(paymentRequest, customAmount);
                          } else {
                              TransactionsStore.sendPayment(paymentRequest);
                          }

                          navigation.navigate('SendingLightning');
                      }}
                      buttonStyle={{
                          backgroundColor: "orange",
                          borderRadius: 30
                      }}
                  />
              </View>}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    lightThemeStyle: {
        flex: 1
    },
    darkThemeStyle: {
        flex: 1,
        backgroundColor: 'black',
        color: 'white'
    },
    content: {
        padding: 20
    },
    label: {
        paddingTop: 5
    },
    value: {
        paddingBottom: 5
    },
    labelDark: {
        paddingTop: 5,
        color: 'white'
    },
    valueDark: {
        paddingBottom: 5,
        color: 'white'
    },
    button: {
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 10,
        paddingRight: 10
    },
    amount: {
        fontSize: 25,
        fontWeight: 'bold'
    },
    amountDark: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'white'
    },
    center: {
        alignItems: 'center',
        paddingTop: 15,
        paddingBottom: 15
    },
    textInput: {
        fontSize: 20,
        color: 'black'
    },
    textInputDark: {
        fontSize: 20,
        color: 'white'
    }
});
